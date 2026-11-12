"""Cookie-session authentication keeps credentials and CSRF at the Django boundary."""

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AuthenticatedSessionSerializer,
    AuthenticationErrorSerializer,
    CsrfSerializer,
    LoginSerializer,
    SessionSerializer,
)


@method_decorator([never_cache, ensure_csrf_cookie], name="dispatch")
class CsrfView(APIView):
    """Initialize a visitor session and return the SDK's masked CSRF header token."""

    # Signed-out browsers need a token before submitting the protected login form.
    permission_classes = [AllowAny]

    @extend_schema(responses=CsrfSerializer, operation_id="csrf_retrieve", auth=[])
    def get(self, request):
        """Return the token without making its HttpOnly cookie readable to JavaScript."""
        # request owns the browser session before concurrent SDK calls can establish competitors.
        if request.session.session_key is None:
            # Preserve one anonymous session until Django rotates its identity during login.
            request.session.create()
        return Response({"csrfToken": get_token(request)})


@method_decorator(never_cache, name="dispatch")
class SessionView(APIView):
    """Read the current cookie session without requiring a pre-existing login."""

    # Signed-out browsers need this public endpoint to select the login screen.
    permission_classes = [AllowAny]

    @extend_schema(responses=SessionSerializer, operation_id="auth_session_retrieve")
    def get(self, request):
        """Return the authenticated user or null; no credentials are included."""
        # current_user is a Django account only after session authentication succeeds.
        current_user = request.user if request.user.is_authenticated else None
        return Response(SessionSerializer({"user": current_user}).data)


@method_decorator([never_cache, csrf_protect], name="dispatch")
class LoginView(APIView):
    """Authenticate a password and rotate Django's session and CSRF credentials."""

    # Login must be callable before authentication, while csrf_protect still applies.
    permission_classes = [AllowAny]

    @extend_schema(
        request=LoginSerializer,
        responses={200: AuthenticatedSessionSerializer, 400: AuthenticationErrorSerializer},
        operation_id="auth_login_create",
    )
    def post(self, request):
        """Validate credentials once and return a generic failure when Django rejects them."""
        # credentials bounds input and keeps password whitespace intact for exact verification.
        credentials = LoginSerializer(data=request.data)
        credentials.is_valid(raise_exception=True)
        # authenticated_user is None for an unknown user, incorrect password, or inactive account.
        authenticated_user = authenticate(request=request._request, **credentials.validated_data)
        if authenticated_user is None:
            # A single message prevents the response from exposing which credential was wrong.
            return Response({"detail": "Invalid username or password."}, status=400)

        # Use the real HttpRequest so session fixation prevention and CSRF rotation run normally.
        login(request._request, authenticated_user)
        return Response(AuthenticatedSessionSerializer({"user": authenticated_user}).data)


@method_decorator([never_cache, csrf_protect], name="dispatch")
class LogoutView(APIView):
    """Flush the current session only after Django validates the browser's CSRF token."""

    # Expired or already-signed-out sessions may explicitly clear their state as well.
    permission_classes = [AllowAny]

    @extend_schema(request=None, responses=SessionSerializer, operation_id="auth_logout_create")
    def post(self, request):
        """Remove authenticated session state without changing any account-owned job history."""
        # Django flushes the HttpRequest session and deletes its browser session cookie.
        logout(request._request)
        return Response({"user": None})

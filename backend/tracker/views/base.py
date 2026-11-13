"""Shared HTTP mechanics keep authorization and domain errors consistent."""

from django.core.exceptions import ValidationError as ModelValidationError
from django.db import IntegrityError
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_protect
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from tracker.services.access import Conflict, membership_for


@method_decorator([never_cache, csrf_protect], name="dispatch")
class TrackerView(APIView):
    """Authenticated, noncacheable API requests with anonymous-safe mutation protection."""

    def membership(self, request, fleet_id, *, write=False, owner=False):
        """Resolve the tenant boundary before fetching any records or invoking commands."""
        return membership_for(request.user, fleet_id, write=write, owner=owner)

    def validated(self, serializer_class, data):
        """Convert one explicit contract into typed domain inputs or a structured HTTP 400."""
        # Validation preserves the original draft because the command has not yet been invoked.
        serializer = serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def respond(self, serializer_class, payload, *, status=200, many=False):
        """Serialize projections explicitly so runtime output matches generated OpenAPI types."""
        return Response(serializer_class(payload, many=many).data, status=status)

    def handle_exception(self, exc):
        """Expose model constraints as safe validation feedback after command rollback."""
        if isinstance(exc, ModelValidationError):
            # Django model errors retain field names when available, otherwise a generic detail
            # list.
            exc = ValidationError(
                exc.message_dict if hasattr(exc, "message_dict") else exc.messages
            )
        elif isinstance(exc, IntegrityError):
            # Concurrent uniqueness failures must not leak SQL or leave an ambiguous successful
            # write.
            exc = Conflict("A conflicting record already exists. Refresh and review.")
        return super().handle_exception(exc)

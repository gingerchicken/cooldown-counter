"""Identity and CSRF contracts remain independent of application domain serializers."""

from rest_framework import serializers


class CsrfSerializer(serializers.Serializer):
    """A masked CSRF token is returned in JSON because its cookie is HttpOnly."""

    # csrfToken matches the package-facing API and is independent of cookie storage details.
    csrfToken = serializers.CharField()


class UserSerializer(serializers.Serializer):
    """Expose only the stable identity needed by the authenticated frontend."""

    # id identifies the account; username provides its display and login identifier.
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(read_only=True)


class SessionSerializer(serializers.Serializer):
    """Represent a signed-out browser with null rather than an authentication error."""

    # user is null when this cookie session has no currently authenticated account.
    user = UserSerializer(allow_null=True, read_only=True)


class AuthenticatedSessionSerializer(serializers.Serializer):
    """A successful login always returns a real account without secret account fields."""

    # user cannot be null after Django has accepted the supplied credentials.
    user = UserSerializer(read_only=True)


class LoginSerializer(serializers.Serializer):
    """Validate bounded credentials without ever serializing a password in a response."""

    # username follows Django's default User length; password whitespace must remain significant.
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(max_length=4096, trim_whitespace=False, write_only=True)


class AuthenticationErrorSerializer(serializers.Serializer):
    """Authentication failures share one generic detail without revealing account existence."""

    # detail is safe to display and does not distinguish unknown, disabled, or incorrect passwords.
    detail = serializers.CharField()

"""Authentication routes remain available when the demonstration jobs app is removed."""

from django.urls import path

from .views import LoginView, LogoutView, SessionView

# urlpatterns is mounted independently at /api/auth/; trailing slashes match the typed client.
urlpatterns = [
    path("session/", SessionView.as_view(), name="auth-session"),
    path("login/", LoginView.as_view(), name="auth-login"),
    path("logout/", LogoutView.as_view(), name="auth-logout"),
]

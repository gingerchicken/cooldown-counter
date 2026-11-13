"""Route the API and local Django administration without serving the React app."""

from django.contrib import admin
from django.urls import include, path

from accounts.views import CsrfView

# The public Pages Function forwards only /api; /admin remains an operator-only route.
# Identity routes are independent of the removable demonstration domain.
urlpatterns = [
    path("api/auth/", include("accounts.urls")),
    path("api/csrf/", CsrfView.as_view(), name="csrf"),
    # Fleet membership is enforced independently at every tracker API boundary.
    path("api/", include("tracker.urls")),
    path("api/", include("jobs.urls")),
    path("admin/", admin.site.urls),
]

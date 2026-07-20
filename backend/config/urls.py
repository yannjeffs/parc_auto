from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenBlacklistView,
)
from config.me_view import MeView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/", include("vehicules.urls")),
    path("api/", include("conducteurs.urls")),
    path("api/", include("maintenance.urls")),
    path("api/", include("carburant.urls")),
    path("api/", include("documents.urls")),
    path("api/rapports/", include("rapports.urls")),

    # Authentification JWT
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/logout/", TokenBlacklistView.as_view(), name="token_blacklist"),
    path("api/auth/me/", MeView.as_view(), name="me"),
]

# Sert les fichiers médias (photos véhicules, documents) en développement
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
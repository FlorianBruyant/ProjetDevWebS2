from django.contrib import admin
from django.urls import include, path

# On importe les vues pour le Badge (JWT)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# On importe ta vue d'inscription "fait maison"
from users.views import RegisterView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Inscription
    path("api/register/", RegisterView.as_view(), name="auth_register"),
    # Connexion (Obtenir le badge)
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # Refresh (Renouveler le badge)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Tes autres APIs
    path("api-map/", include("map.urls")),
    path("api/", include("api.urls")),  # ancien couloir
]

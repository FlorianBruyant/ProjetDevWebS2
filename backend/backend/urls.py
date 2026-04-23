from django.contrib import admin
from django.urls import include, path

# On importe les vues pour le Badge (JWT)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# On importe vues d'inscription et de profil
from users.views import RegisterView, UserProfileView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Inscription
    path("api/register/", RegisterView.as_view(), name="auth_register"),
    # Connexion (Obtenir le badge)
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    # Profil
    path("api/me/", UserProfileView.as_view(), name="user_profile"),
    # Refresh (Renouveler le badge)
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Tes autres APIs
    path("api-map/", include("map.urls")),
    path("api/", include("api.urls")),  # ancien couloir
]

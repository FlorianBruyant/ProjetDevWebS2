from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

# Imports JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# On importe TOUTES tes vues personnalisées depuis users.views
from users.views import (
    ActivateAccountView,
    PasswordResetConfirmView,  # La vue pour l'étape 3
    PasswordResetRequestView,  # La vue pour l'étape 1
    RegisterView,
    UserProfileView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # --- AUTHENTIFICATION & PROFIL ---
    path("api/register/", RegisterView.as_view(), name="auth_register"),
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/me/", UserProfileView.as_view(), name="user_profile"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # --- ACTIVATION DU COMPTE ---
    path(
        "api/activate/<str:uidb64>/<str:token>/",
        ActivateAccountView.as_view(),
        name="activate",
    ),
    # --- RÉINITIALISATION DU MOT DE PASSE (Version API pour React) ---
    # 1. Demande de lien (React appelle ça depuis DemandeReset.jsx)
    path(
        "api/password_reset/",
        PasswordResetRequestView.as_view(),
        name="password_reset",
    ),
    # 3. Validation du nouveau mot de passe (React appelle ça depuis NouveauMotDePasse.jsx)
    path(
        "api/password_reset_confirm/<str:uidb64>/<str:token>/",
        PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    # --- AUTRES APIS ---
    path("api/map/", include("map.urls")),
    path("api/", include("api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

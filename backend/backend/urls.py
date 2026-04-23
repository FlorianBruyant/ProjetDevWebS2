from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import include, path

# On importe les vues pour le Badge (JWT)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# On importe vues d'inscription et de profil
from users.views import ActivateAccountView, RegisterView, UserProfileView

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
    # 1. Formulaire pour demander la réinitialisation (React enverra l'email ici)
    path(
        "api/password_reset/",
        auth_views.PasswordResetView.as_view(),
        name="password_reset",
    ),
    # 2. Confirmation que le mail est envoyé
    path(
        "api/password_reset/done/",
        auth_views.PasswordResetDoneView.as_view(),
        name="password_reset_done",
    ),
    # 3. Le lien unique envoyé par mail (Django vérifie le token ici)
    path(
        "api/reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(),
        name="password_reset_confirm",
    ),
    # 4. Confirmation finale du changement
    path(
        "api/reset/done/",
        auth_views.PasswordResetCompleteView.as_view(),
        name="password_reset_complete",
    ),
    path(
        "api/activate/<str:uidb64>/<str:token>/",
        ActivateAccountView.as_view(),
        name="activate",
    ),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.urls import include, path

# Imports JWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# On importe TOUTES tes vues personnalisées depuis users.views
from users.views import (
    ActivateAccountView,
    MemberProfileView,
    PasswordResetConfirmView,  # La vue pour l'étape 3
    PasswordResetRequestView,  # La vue pour l'étape 1
    RegisterView,
    UserListView,
    UserProfileView,
)


def racine(request):
    """Page d'entrée simple pour choisir la section du backend."""
    html = """
    <!doctype html>
    <html lang="fr">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Backend Smart City</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #f5f7fb; color: #1f2937; }
            .card { background: white; padding: 32px; border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,.08); width: min(520px, calc(100vw - 32px)); }
            h1 { margin-top: 0; }
            ul { list-style: none; padding: 0; margin: 24px 0 0; display: grid; gap: 12px; }
            a { display: block; padding: 14px 16px; border-radius: 12px; text-decoration: none; background: #111827; color: white; font-weight: 700; }
            a:hover { background: #374151; }
            p { line-height: 1.5; }
        </style>
    </head>
    <body>
        <main class="card">
            <h1>Backend Smart City</h1>
            <p>Choisis une section du backend :</p>
            <ul>
                <li><a href="/admin/">Administration</a></li>
                <li><a href="/api/">API</a></li>
                <li><a href="/api/map/">Map</a></li>
            </ul>
        </main>
    </body>
    </html>
    """
    return HttpResponse(html)


urlpatterns = [
    path("", racine, name="racine"),
    path("admin/", admin.site.urls),
    # --- AUTHENTIFICATION & PROFIL ---
    path("api/register/", RegisterView.as_view(), name="auth_register"),
    path("api/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/members/<int:id>/", MemberProfileView.as_view(), name="member-profile"),
    path("api/members/", UserListView.as_view(), name="user-list"),
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

from django.conf import settings
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import CustomUser
from .serializers import UserSerializer


class PasswordResetRequestView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    # On n'a pas besoin de serializer ici, donc on supprime l'appel à get_serializer
    serializer_class = None

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Veuillez fournir une adresse email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # On utilise le formulaire natif de Django pour gérer la logique
        form = PasswordResetForm({"email": email})

        if form.is_valid():
            # On récupère les utilisateurs correspondant à l'email
            for user in form.get_users(email):
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)

                lien = f"http://localhost:5173/reset-password/{uid}/{token}/"

                sujet = "Réinitialisation de votre mot de passe"
                message = f"Bonjour {user.username},\n\nCliquez sur ce lien pour changer votre mot de passe : {lien}"

                send_mail(
                    sujet,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email],
                    fail_silently=False,
                )
            return Response({"message": "Lien envoyé !"}, status=status.HTTP_200_OK)

        return Response(
            {"error": "Email invalide."}, status=status.HTTP_400_BAD_REQUEST
        )


# Vue pour valider le nouveau mot de passe
class PasswordResetConfirmView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        new_password = request.data.get("password")
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except:
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.set_password(new_password)
            user.save()
            return Response(
                {"message": "Mot de passe modifié !"}, status=status.HTTP_200_OK
            )
        return Response({"error": "Lien invalide."}, status=status.HTTP_400_BAD_REQUEST)


def envoyer_confirmation_email(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    # Le lien qui renvoie vers app React (Port 5173)
    lien = f"http://localhost:5173/confirmer-email/{uid}/{token}/"

    sujet = "Confirmez votre compte Smart City Cergy"
    message = (
        f"Bonjour {user.username},\n\n"
        f"Bienvenue sur Smart City ! Cliquez sur le lien ci-dessous pour activer votre compte :\n"
        f"{lien}"
    )

    send_mail(
        sujet,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


# 1. Vue d'inscription
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

    def perform_create(self, serializer):
        # On sauvegarde l'utilisateur
        user = serializer.save()
        # Le compte reste inactif jusqu'à la confirmation email
        user.is_active = False
        user.save()

        try:
            envoyer_confirmation_email(user)
        except Exception as e:
            # Utile pour debugger tes accès Mailtrap dans la console
            print(f"Erreur d'envoi d'email : {e}")


# 2. Vue d'activation du compte
class ActivateAccountView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, uidb64, token):
        try:
            # Décodage de l'ID utilisateur
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            user = None

        # Vérification de la validité du token
        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response(
                {"message": "Compte activé avec succès !"}, status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Lien invalide ou expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )


# 3. Vue Profil (Rappel pour fichier complet)
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

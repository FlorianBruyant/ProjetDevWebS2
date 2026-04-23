from rest_framework import generics, permissions

from .models import CustomUser
from .serializers import UserSerializer


# 1. Vue d'inscription
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer


# 2. Vue pour récupérer les infos de l'utilisateur connecté (/api/me/)
class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    Permet de récupérer (GET) ou modifier (PATCH)
    le profil de l'utilisateur actuellement connecté.
    """

    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]  # Obligé d'être connecté !

    def get_object(self):
        # On renvoie l'utilisateur lié au Token envoyé par React
        return self.request.user

    def patch(self, request, *args, **kwargs):
        # Cette méthode permet de logger ou d'ajouter une logique
        # spécifique lors de la modification du profil
        return super().patch(request, *args, **kwargs)

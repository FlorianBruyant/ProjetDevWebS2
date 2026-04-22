from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import CustomUser
from .serializers import UserSerializer


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    # "AllowAny" car tout le monde doit pouvoir accéder à la page d'inscription !
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

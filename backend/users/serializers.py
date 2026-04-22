from rest_framework import serializers

from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ("id", "username", "email", "password", "role")
        # On cache le mot de passe, il ne doit jamais ressortir de l'API !
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # Cette fonction crée l'utilisateur proprement (avec mot de passe haché)
        user = CustomUser.objects.create_user(**validated_data)
        return user

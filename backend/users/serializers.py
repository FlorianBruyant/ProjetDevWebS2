from rest_framework import serializers

from .models import CustomUser


# Serializer pour la liste des users
class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "genre", "role", "type_membre", "niveau", "points"]


class UserSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        # On ajoute les nouveaux champs liés au cahier des charges
        fields = (
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "niveau",  # AJOUT : Niveau (Débutant, Intermédiaire...)
            "points",  # AJOUT : XP
            "genre",  # AJOUT : Sexe / Genre (Profil Public)
            "type_membre",  # AJOUT : Type (Profil Public)
            "nb_acces",
            "date_derniere_action",
            "is_staff",
            "is_active",
            "date_joined",
            "photo",
            "photo_url",
        )

        # Configuration spéciale des colonnes
        extra_kwargs = {
            "password": {"write_only": True},  # Le mot de passe ne sort jamais du back
            "nb_acces": {"read_only": True},  # Lu seulement (géré par le signal auto)
            "date_derniere_action": {"read_only": True},  # Lu seulement (auto_now)
            "date_joined": {"read_only": True},  # Lu seulement (géré par Django)
            "niveau": {"read_only": True},  # Sécurité : calculé automatiquement
            "points": {"read_only": True},  # Sécurité : géré via les vues d'actions
            "photo": {
                "write_only": True
            },  # On envoie le fichier, on ne le reçoit pas en JSON
        }

    def create(self, validated_data):
        # Cette fonction crée l'utilisateur proprement (avec mot de passe haché)
        user = CustomUser.objects.create_user(**validated_data)
        return user

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.photo.url)
            # Sécurité au cas où le serializer est appelé sans request dans le contexte
            return obj.photo.url
        return None

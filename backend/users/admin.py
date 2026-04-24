from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ActionLog, CustomUser


class CustomUserAdmin(UserAdmin):
    # Les colonnes visibles dans le tableau de la liste des utilisateurs
    list_display = (
        "username",
        "email",
        "role",
        "niveau",
        "points",
        "nb_acces",
        "is_staff",
    )

    # Comme "date_derniere_action" se met à jour tout seul (auto_now=True),
    # il doit être mis en "lecture seule" dans l'admin
    readonly_fields = ("date_derniere_action",)

    # Les champs visibles quand tu cliques sur un utilisateur pour le modifier
    fieldsets = UserAdmin.fieldsets + (
        (
            "Infos Smart City",
            {
                "fields": (
                    "role",
                    "niveau",
                    "points",
                    "genre",
                    "date_naissance",
                    "type_membre",
                    "photo",
                    "nb_acces",
                    "date_derniere_action",
                )
            },
        ),
    )

    # Les champs visibles quand tu crées un NOUVEL utilisateur depuis l'admin
    add_fieldsets = UserAdmin.add_fieldsets + (
        (
            "Infos Smart City",
            {
                "fields": (
                    "role",
                    "niveau",
                    "points",
                    "genre",
                    "type_membre",
                    "nb_acces",
                )
            },
        ),
    )


# On enregistre nos modèles pour qu'ils apparaissent dans l'Admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ActionLog)

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ActionLog, CustomUser


class CustomUserAdmin(UserAdmin):
    # On ajoute nos champs personnalisés dans la liste du tableau
    list_display = ("username", "email", "role", "nb_acces", "is_staff")

    # On ajoute nos champs dans le formulaire de modification (quand on clique sur l'user)
    fieldsets = UserAdmin.fieldsets + (
        ("Infos Smart City", {"fields": ("role", "nb_acces")}),
    )

    # On permet aussi de modifier ces champs lors de la création d'un utilisateur
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Infos Smart City", {"fields": ("role", "nb_acces")}),
    )


# On enregistre nos modèles pour qu'ils apparaissent dans l'Admin
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(ActionLog)

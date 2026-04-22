from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import ActionLog, CustomUser

# On enregistre l'utilisateur personnalisé et les logs
admin.site.register(CustomUser, UserAdmin)
admin.site.register(ActionLog)

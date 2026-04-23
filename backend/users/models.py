from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.db import models
from django.dispatch import receiver


# Modèle Utilisateur
class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("VISITEUR", "Visiteur"),
        ("SIMPLE", "Simple"),
        ("COMPLEXE", "Complexe"),
        ("ADMIN", "Administrateur"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="VISITEUR")
    nb_acces = models.IntegerField(default=0, help_text="Nombre total de connexions")
    date_derniere_action = models.DateTimeField(auto_now=True)

    photo = models.ImageField(upload_to="profils/", null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# 2. Ton journal d'actions (Tracking)
class ActionLog(models.Model):
    utilisateur = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.utilisateur.username} : {self.action}"


# 3. Ton "Signal" (L'alarme qui se déclenche au login)
@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    # On augmente le compteur
    user.nb_acces += 1
    user.save()

    # On écrit dans le journal
    ActionLog.objects.create(utilisateur=user, action="Connexion à la plateforme")

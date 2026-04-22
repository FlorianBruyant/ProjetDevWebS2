from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ("VISITEUR", "Visiteur"),
        ("SIMPLE", "Simple"),
        ("COMPLEXE", "Complexe"),
        ("ADMIN", "Administrateur"),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="VISITEUR")

    # --- AJOUT POUR LE MODULE 2 (Suivi des accès) ---
    nb_acces = models.IntegerField(default=0, help_text="Nombre total de connexions")
    date_derniere_action = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# --- AJOUT POUR LE MODULE 2 (Journalisation/Tracking) ---
class ActionLog(models.Model):
    utilisateur = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)  # ex: "A consulté le parking A"
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.utilisateur.username} : {self.action}"

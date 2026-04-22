from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # On prépare la liste des rôles possibles
    ROLE_CHOICES = (
        ("VISITEUR", "Visiteur"),
        ("SIMPLE", "Simple"),
        ("COMPLEXE", "Complexe"),
        ("ADMIN", "Administrateur"),
    )

    # On ajoute une case "rôle" sur la fiche d'identité
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="VISITEUR")

    def __str__(self):
        # C'est juste pour que le nom s'affiche joliment plus tard
        return f"{self.username} ({self.role})"

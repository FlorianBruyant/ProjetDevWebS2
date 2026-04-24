from django.contrib.auth.models import AbstractUser
from django.contrib.auth.signals import user_logged_in
from django.db import models
from django.dispatch import receiver


class CustomUser(AbstractUser):
    # Rôles liés aux modules du cahier des charges
    ROLE_CHOICES = (
        ("VISITEUR", "Visiteur"),
        ("SIMPLE", "Simple"),
        ("COMPLEXE", "Complexe"),
        ("ADMIN", "Administrateur"),
    )
    # Niveaux d'expérience (Page 5)
    NIVEAU_CHOICES = (
        ("DEBUTANT", "Débutant"),
        ("INTERMEDIAIRE", "Intermédiaire"),
        ("AVANCE", "Avancé"),
        ("EXPERT", "Expert"),
    )
    # Genres (Page 3)
    GENRE_CHOICES = (
        ("M", "Masculin"),
        ("F", "Féminin"),
        ("A", "Autre"),
        ("NR", "Non renseigné"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="SIMPLE")
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default="DEBUTANT")
    points = models.FloatField(
        default=0.0, help_text="Système de points pour l'évolution du niveau"
    )

    # Champs du profil public exigés (Page 3)
    genre = models.CharField(max_length=2, choices=GENRE_CHOICES, default="NR")
    date_naissance = models.DateField(null=True, blank=True)
    type_membre = models.CharField(
        max_length=50,
        default="Citoyen",
        help_text="Ex: Citoyen, Agent municipal, Touriste...",
    )
    photo = models.ImageField(upload_to="profils/", null=True, blank=True)

    # Tracking (Page 6)
    nb_acces = models.IntegerField(default=0, help_text="Nombre total de connexions")
    date_derniere_action = models.DateTimeField(auto_now=True)

    def verifier_et_mettre_a_jour_niveau(self):
        """Méthode pour ajuster le niveau en fonction des points (Valeurs d'exemple)"""
        if self.points >= 7.0:
            self.niveau = "EXPERT"
        elif self.points >= 5.0:
            self.niveau = "AVANCE"
        elif self.points >= 3.0:
            self.niveau = "INTERMEDIAIRE"
        else:
            self.niveau = "DEBUTANT"
        self.save()

    def __str__(self):
        return (
            f"{self.username} ({self.get_role_display()} - {self.get_niveau_display()})"
        )


class ActionLog(models.Model):
    utilisateur = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    action = models.CharField(max_length=255)
    points_gagnes = models.FloatField(default=0.0)
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.date} - {self.utilisateur.username} : {self.action} (+{self.points_gagnes} pts)"


@receiver(user_logged_in)
def log_user_login(sender, request, user, **kwargs):
    # On augmente le compteur de connexion
    user.nb_acces += 1
    # Ajout de 0.25 points pour la connexion (Exemple Page 5)
    user.points += 0.25
    user.verifier_et_mettre_a_jour_niveau()
    user.save()

    # On écrit dans le journal
    ActionLog.objects.create(
        utilisateur=user, action="Connexion à la plateforme", points_gagnes=0.25
    )

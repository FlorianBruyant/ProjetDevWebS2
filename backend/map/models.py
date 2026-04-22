from django.db import models

# ==========================================
# 1. LES FONDATIONS (ZONES ET POINTS)
# ==========================================


class Zone(models.Model):
    """Module 3.2 : Permet d'associer des objets à des quartiers spécifiques"""

    nom = models.CharField(max_length=100, help_text="Ex: Centre-Ville, Zone Nord")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom


class Point(models.Model):
    """La brique de base : une position GPS"""

    latitude = models.FloatField()
    longitude = models.FloatField()
    zone = models.ForeignKey(
        Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name="points"
    )

    def __str__(self):
        return f"Point ({self.latitude}, {self.longitude}) - {self.zone if self.zone else 'Sans zone'}"


# ==========================================
# 2. LES OBJETS CONNECTÉS (MODULE 3.1)
# ==========================================


class TrafficObject(models.Model):
    """
    Classe de base (Abstraite) pour que tous nos objets aient
    les fonctions demandées : Activer/Désactiver, Maintenance, Statut.
    """

    nom = models.CharField(max_length=100)
    est_actif = models.BooleanField(
        default=True, help_text="Module 3.1 : Contrôler l'état (Activer/Désactiver)"
    )
    en_panne = models.BooleanField(
        default=False,
        help_text="Module 3.3 : Identifier les objets nécessitant maintenance",
    )
    derniere_mise_a_jour = models.DateTimeField(
        auto_now=True, help_text="Module 3.1 : Test de connectivité"
    )

    class Meta:
        abstract = (
            True  # Cette classe ne crée pas de table, elle sert de modèle aux autres
        )


class Feu(TrafficObject):
    """Module 1 & 3 : Les feux tricolores intelligents"""

    COULEURS = (("VERT", "Vert"), ("ORANGE", "Orange"), ("ROUGE", "Rouge"))

    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    etat_actuel = models.CharField(max_length=10, choices=COULEURS, default="ROUGE")
    temps_avant_changement = models.IntegerField(default=30)
    cycle_config = models.JSONField(
        default=dict, help_text="Ex: {'vert': 30, 'orange': 5, 'rouge': 30}"
    )

    def __str__(self):
        return f"Feu {self.nom} ({self.etat_actuel})"


class Parking(TrafficObject):
    """Module 1 & 3 : Gestion des parkings"""

    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    places_occupees = models.IntegerField(default=0)
    places_totales = models.IntegerField()

    def __str__(self):
        return f"Parking {self.nom} ({self.places_occupees}/{self.places_totales})"


class Vehicule(TrafficObject):
    """Module 1 & 3 : Bus, voitures connectées"""

    immatriculation = models.CharField(max_length=20, unique=True)
    vitesse = models.FloatField(default=0.0)
    point_actuel = models.ForeignKey(
        Point, related_name="vehicules_ici", on_delete=models.SET_NULL, null=True
    )
    prochain_point = models.ForeignKey(
        Point, related_name="vehicules_vers", on_delete=models.SET_NULL, null=True
    )
    historique_points = models.ManyToManyField(
        Point, related_name="historique_vehicules", blank=True
    )

    def __str__(self):
        return f"Véhicule {self.immatriculation} ({self.nom})"


# ==========================================
# 3. INFRASTRUCTURE ET INCIDENTS
# ==========================================


class Route(models.Model):
    """Module 1 : Infrastructures routières"""

    nom = models.CharField(max_length=100)
    points = models.ManyToManyField(Point, related_name="routes")
    feux = models.ManyToManyField(Feu, blank=True, related_name="routes")
    nombre_vehicules_actuel = models.IntegerField(default=0)

    def __str__(self):
        return self.nom


class Incident(models.Model):
    """Module 1 : Rapports d'incidents (Inondations, accidents, lampadaires)"""

    TYPES = (
        ("ACCIDENT", "Accident"),
        ("INONDATION", "Inondation"),
        ("PANNE_ECLAIRAGE", "Panne de lampadaire"),
        ("TRAVAUX", "Travaux"),
    )
    type_incident = models.CharField(max_length=50, choices=TYPES)
    description = models.TextField(blank=True)
    debut = models.DateTimeField(auto_now_add=True)
    fin = models.DateTimeField(null=True, blank=True)
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    gravite = models.IntegerField(default=1, help_text="De 1 à 5")

    def __str__(self):
        return f"{self.type_incident} à {self.position}"

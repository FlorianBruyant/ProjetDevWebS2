from django.db import models

# ==========================================
# 1. LES FONDATIONS (ZONES ET POINTS)
# ==========================================


class Zone(models.Model):
    nom = models.CharField(max_length=100, help_text="Ex: Centre-Ville, Zone Nord")
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom


class Point(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()
    zone = models.ForeignKey(
        Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name="points"
    )

    def __str__(self):
        return f"Point ({self.latitude}, {self.longitude}) - {self.zone if self.zone else 'Sans zone'}"


# ==========================================
# 2. LES OBJETS CONNECTÉS
# ==========================================


class TrafficObject(models.Model):
    """
    Classe de base (Abstraite) mise à jour pour inclure les attributs
    de recherche et de connectivité demandés dans le PDF (Pages 4-5).
    """

    nom = models.CharField(max_length=100)
    description = models.TextField(
        blank=True, help_text="Description contenant potentiellement des mots-clés"
    )
    marque = models.CharField(
        max_length=50,
        blank=True,
        default="Non spécifiée",
        help_text="Ex: Phillips, Siemens...",
    )
    type_objet = models.CharField(
        max_length=50,
        default="Non défini",
        help_text="Ex: Feu, Caméra, Thermostat, Capteur",
    )

    mots_cles = models.CharField(
        max_length=255, blank=True, help_text="Pour le moteur de recherche"
    )

    # États de l'objet
    est_actif = models.BooleanField(default=True, help_text="Activer/Désactiver")
    est_connecte = models.BooleanField(
        default=True, help_text="État de la connexion au réseau"
    )
    en_panne = models.BooleanField(
        default=False, help_text="Identifier les objets nécessitant maintenance"
    )

    # Attributs d'énergie et de connectivité
    connectivite = models.CharField(
        max_length=50, default="Wi-Fi", help_text="Type de réseau (Wi-Fi, 4G, LoRa...)"
    )
    niveau_batterie = models.IntegerField(
        null=True, blank=True, help_text="Niveau de batterie en %"
    )

    derniere_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Feu(TrafficObject):
    COULEURS = (("VERT", "Vert"), ("ORANGE", "Orange"), ("ROUGE", "Rouge"))

    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    etat_actuel = models.CharField(max_length=10, choices=COULEURS, default="ROUGE")
    temps_avant_changement = models.IntegerField(default=30)
    cycle_config = models.JSONField(
        default=dict,
        help_text="Paramètres d'utilisation : {'vert': 30, 'orange': 5, 'rouge': 30}",
    )

    def save(self, *args, **kwargs):
        if not self.type_objet:
            self.type_objet = "Feu tricolore"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Feu {self.nom} ({self.etat_actuel})"


class Parking(TrafficObject):
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    places_occupees = models.IntegerField(default=0)
    places_totales = models.IntegerField()

    def save(self, *args, **kwargs):
        if not self.type_objet:
            self.type_objet = "Parking connecté"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Parking {self.nom} ({self.places_occupees}/{self.places_totales})"


class Vehicule(TrafficObject):
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

    def save(self, *args, **kwargs):
        if not self.type_objet:
            self.type_objet = "Véhicule"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Véhicule {self.immatriculation} ({self.nom})"


# ==========================================
# 3. INFRASTRUCTURE ET INCIDENTS
# ==========================================


class Route(models.Model):
    nom = models.CharField(max_length=100)
    points = models.ManyToManyField(Point, related_name="routes")
    feux = models.ManyToManyField(Feu, blank=True, related_name="routes")
    nombre_vehicules_actuel = models.IntegerField(default=0)

    def __str__(self):
        return self.nom


class Incident(models.Model):
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

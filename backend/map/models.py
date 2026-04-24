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
    # On garde ce lien pour la géolocalisation pure
    zone = models.ForeignKey(
        Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name="points"
    )

    def __str__(self):
        return f"Point ({self.latitude}, {self.longitude})"


# ==========================================
# 2. LES OBJETS CONNECTÉS
# ==========================================


class TrafficObject(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # 👇 NOUVEAU : Lien direct avec la Zone pour faciliter la gestion CRUD
    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_set",
    )

    marque = models.CharField(max_length=50, blank=True, default="Non spécifiée")
    type_objet = models.CharField(max_length=50, default="Non défini")
    mots_cles = models.CharField(max_length=255, blank=True)

    est_actif = models.BooleanField(default=True)
    est_connecte = models.BooleanField(default=True)
    en_panne = models.BooleanField(default=False)

    connectivite = models.CharField(max_length=50, default="Wi-Fi")
    niveau_batterie = models.IntegerField(null=True, blank=True)
    derniere_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Feu(TrafficObject):
    COULEURS = (("VERT", "Vert"), ("ORANGE", "Orange"), ("ROUGE", "Rouge"))
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    etat_actuel = models.CharField(max_length=10, choices=COULEURS, default="ROUGE")
    temps_avant_changement = models.IntegerField(default=30)
    cycle_config = models.JSONField(default=dict)

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
        return f"Véhicule {self.immatriculation}"


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
        ("PANNE_ECLAIRAGE", "Panne"),
        ("TRAVAUX", "Travaux"),
    )
    type_incident = models.CharField(max_length=50, choices=TYPES)
    description = models.TextField(blank=True)
    debut = models.DateTimeField(auto_now_add=True)
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    gravite = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.type_incident} à {self.position}"

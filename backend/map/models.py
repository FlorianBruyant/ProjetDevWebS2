import requests  # 👈 Nécessaire pour appeler l'API externe
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
        return f"Point ({self.latitude}, {self.longitude})"


# ==========================================
# 2. LES OBJETS CONNECTÉS
# ==========================================


class TrafficObject(models.Model):
    nom = models.CharField(max_length=100)
    type_objet = models.CharField(max_length=50, blank=True)  # Ex: "Feu tricolore"
    description = models.TextField(blank=True)
    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="%(class)s_set",
    )

    # --- SURVEILLANCE & RESSOURCES ---
    niveau_batterie = models.IntegerField(null=True, blank=True, help_text="En %")
    consommation_actuelle = models.FloatField(default=0.0, help_text="Watts/h")
    temperature_actuelle = models.FloatField(null=True, blank=True, help_text="En °C")

    # --- CONFIGURATION & SERVICES ---
    # Permet de stocker {'temp_cible': 22, 'mode': 'auto'} ou {'cycle_vert': 45}
    parametres_service = models.JSONField(default=dict, blank=True)
    horaires_fonctionnement = models.JSONField(default=dict, blank=True)

    # --- ÉTATS ---
    est_actif = models.BooleanField(default=True)
    en_panne = models.BooleanField(default=False)
    derniere_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def determiner_zone_auto(self, lat, lon):
        """Appelle l'API Géo pour récupérer le nom de la commune/quartier"""
        try:
            # On interroge l'API officielle française
            url = f"https://geo.api.gouv.fr/communes?lat={lat}&lon={lon}&fields=nom"
            reponse = requests.get(url, timeout=2)
            data = reponse.json()

            if data and len(data) > 0:
                nom_commune = data[0]["nom"]
                # On récupère la zone si elle existe, sinon on la crée
                zone_obj, created = Zone.objects.get_or_create(nom=nom_commune)
                return zone_obj
        except Exception as e:
            print(f"Erreur API Géo : {e}")
        return None

    def save(self, *args, **kwargs):
        # 🎯 LOGIQUE D'AUTOMATISATION
        # On essaie de trouver les coordonnées de l'objet
        lat, lon = None, None

        if hasattr(self, "position") and self.position:
            lat, lon = self.position.latitude, self.position.longitude
        elif hasattr(self, "point_actuel") and self.point_actuel:
            lat, lon = self.point_actuel.latitude, self.point_actuel.longitude

        # Si on a des coordonnées mais pas de zone, on automatise
        if lat and lon and not self.zone:
            self.zone = self.determiner_zone_auto(lat, lon)

        super().save(*args, **kwargs)


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


class Scenario(models.Model):
    CATEGORIES = (
        ("TRAFFIC", "Gestion du Trafic"),
        ("SAFETY", "Sécurité & Incidents"),
        ("ENERGY", "Optimisation Énergie"),
        ("MAINTENANCE", "Maintenance Automatique"),
    )

    nom = models.CharField(max_length=100)
    categorie = models.CharField(max_length=20, choices=CATEGORIES, default="TRAFFIC")

    # --- LA CONDITION (IF) ---
    declencheur_champ = models.CharField(max_length=50)
    operateur = models.CharField(
        max_length=5, choices=[(">", ">"), ("<", "<"), ("==", "=="), ("in", "Contient")]
    )
    valeur_seuil = models.CharField(max_length=100)

    # --- L'ACTION (THEN) ---
    action_champ = models.CharField(max_length=50)
    action_valeur = models.CharField(max_length=100)

    est_actif = models.BooleanField(default=True)

    def __str__(self):
        return f"[{self.categorie}] {self.nom}"

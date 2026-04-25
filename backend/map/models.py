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

    def __str__(self):
        return f"Point ({self.latitude}, {self.longitude})"


# ==========================================
# 2. LES OBJETS CONNECTÉS
# ==========================================


class TrafficObject(models.Model):
    nom = models.CharField(max_length=100)
    type_objet = models.CharField(max_length=50, blank=True)
    description = models.TextField(blank=True, null=True)
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
        try:
            url = f"https://api-adresse.data.gouv.fr/reverse/?lon={lon}&lat={lat}"
            reponse = requests.get(url, timeout=5)
            data = reponse.json()

            if data and "features" in data and len(data["features"]) > 0:
                props = data["features"][0]["properties"]

                # --- STRATÉGIE DE NOMMAGE ---
                # 1. District : À Paris, c'est l'Arrondissement (ex: Paris 15e)
                # 2. Street : Le nom de la rue SANS le numéro (ex: Avenue de la Porte de Sèvres)
                # 3. City : En dernier recours

                arrondissement = props.get("district")
                rue_seule = props.get("street")
                ville = props.get("city")

                if arrondissement:
                    # Résultat : "Paris 15e Arrondissement"
                    nom_final = arrondissement
                elif rue_seule:
                    # Résultat : "Secteur Avenue de la Porte de Sèvres"
                    nom_final = f"Secteur {rue_seule}"
                else:
                    nom_final = ville

                # Création de la zone
                zone_obj, created = Zone.objects.get_or_create(nom=nom_final)
                return zone_obj
        except Exception as e:
            print(f"Erreur : {e}")
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


class LieuInteret(TrafficObject):
    CATEGORIES = [
        ("musee", "Musée"),
        ("parc", "Parc"),
        ("restaurant", "Restaurant"),
        ("bibliotheque", "Bibliothèque"),
    ]
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    categorie = models.CharField(max_length=30, choices=CATEGORIES)
    site_web = models.URLField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.nom} ({self.get_categorie_display()})"


class Evenement(TrafficObject):
    TYPES = [
        ("festival", "Festival"),
        ("marche", "Marché"),
        ("concert", "Concert"),
        ("autre", "Autre Événement"),
    ]
    position = models.ForeignKey(Point, on_delete=models.CASCADE)
    type_evenement = models.CharField(max_length=30, choices=TYPES)
    date_debut = models.DateTimeField()

    def __str__(self):
        return f"{self.nom} - {self.date_debut.strftime('%d/%m/%Y')}"


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


# ==========================================
# 4. STATISTIQUES
# ==========================================


class HistoriqueObjet(models.Model):
    TYPES_CHOICES = [
        ("vehicule", "Véhicule"),
        ("feu", "Feu"),
        ("parking", "Parking"),
        ("lieu", "Lieu d'intérêt"),
        ("evenement", "Événement"),
    ]

    objet_id = models.PositiveIntegerField()  # L'ID de l'objet d'origine
    type_objet = models.CharField(max_length=20, choices=TYPES_CHOICES)
    date_mesure = models.DateTimeField(auto_now_add=True)

    # --- Champs techniques (pour objets) ---
    consommation_kwh = models.FloatField(default=0.0)
    est_en_panne = models.BooleanField(default=False)

    # Donnée contextuelle (ex: % de remplissage pour parking, vitesse pour bus)
    valeur_specifique = models.FloatField(null=True, blank=True)

    # --- Champs sociaux (pour lieux et événements) ---
    frequentation = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        ordering = ["-date_mesure"]
        indexes = [
            models.Index(fields=["type_objet", "objet_id"]),
            models.Index(fields=["date_mesure"]),
        ]

    def __str__(self):
        return f"Mesure {self.type_objet} #{self.objet_id} - {self.date_mesure}"

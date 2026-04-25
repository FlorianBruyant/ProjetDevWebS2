from rest_framework import serializers
from users.models import ActionLog

from .models import (
    Evenement,
    Feu,
    HistoriqueObjet,
    LieuInteret,
    Parking,
    Point,
    Scenario,
    Vehicule,
    Zone,
)


class ZoneToleranteMixin:
    """
    Ce mixin intercepte les requêtes. Si on reçoit du texte au lieu d'un ID
    pour la zone, il crée la zone à la volée et remplace le texte par le nouvel ID.
    """

    def to_internal_value(self, data):
        mutable_data = data.copy() if hasattr(data, "copy") else dict(data)
        zone_data = mutable_data.get("zone")

        if (
            isinstance(zone_data, str)
            and not zone_data.isdigit()
            and zone_data.strip() != ""
        ):
            nouvelle_zone, created = Zone.objects.get_or_create(nom=zone_data.strip())
            mutable_data["zone"] = nouvelle_zone.id
        elif zone_data == "":
            mutable_data["zone"] = None

        return super().to_internal_value(mutable_data)


# --- Sérialiseur pour l'historique des users (Stats) ---
class ActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        fields = ["action", "date", "points_gagnes"]


# --- Sérialiseur pour l'historique des objets (Stats) ---
class HistoriqueTechniqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoriqueObjet
        fields = ["date_mesure", "consommation_kwh", "est_en_panne", "frequentation"]


# --- Sérialiseur pour les Zones ---
class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"


# --- Sérialiseur pour les Points (Coordonnées) ---
class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = "__all__"


# --- Sérialiseur pour les Véhicules ---
class VehiculeSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="point_actuel", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="vehicules")

    class Meta:
        model = Vehicule
        fields = [
            "id",
            "nom",
            "description",
            "est_actif",
            "en_panne",
            "immatriculation",
            "vitesse",
            "point_actuel",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        # On récupère les 10 derniers relevés techniques du véhicule
        logs = HistoriqueObjet.objects.filter(
            type_objet="vehicule", objet_id=obj.id
        ).order_by("-date_mesure")[:10]
        return HistoriqueTechniqueSerializer(logs, many=True).data


# --- Sérialiseur pour les Feux ---
class FeuSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="feux")

    class Meta:
        model = Feu
        fields = [
            "id",
            "nom",
            "description",
            "est_actif",
            "en_panne",
            "etat_actuel",
            "temps_avant_changement",
            "position",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        logs = HistoriqueObjet.objects.filter(
            type_objet="feu", objet_id=obj.id
        ).order_by("-date_mesure")[:10]
        return HistoriqueTechniqueSerializer(logs, many=True).data


# --- Sérialiseur pour les Parkings ---
class ParkingSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="parkings")

    class Meta:
        model = Parking
        fields = [
            "id",
            "nom",
            "description",
            "est_actif",
            "en_panne",
            "places_occupees",
            "places_totales",
            "position",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        logs = HistoriqueObjet.objects.filter(
            type_objet="parking", objet_id=obj.id
        ).order_by("-date_mesure")[:10]
        return HistoriqueTechniqueSerializer(logs, many=True).data


# --- Sérialiseur pour les Lieux d'intérêt ---
class LieuInteretSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="lieux")

    class Meta:
        model = LieuInteret
        fields = [
            "id",
            "nom",
            "description",
            "est_actif",
            "en_panne",
            "categorie",
            "position",
            "point_actuel_details",
            "zone",
            "site_web",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        # On filtre par type 'lieu'
        logs = HistoriqueObjet.objects.filter(
            type_objet="lieu", objet_id=obj.id
        ).order_by("-date_mesure")[:10]
        return HistoriqueTechniqueSerializer(logs, many=True).data


# --- Sérialiseur pour les Événements ---
class EvenementSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="evenements")

    class Meta:
        model = Evenement
        fields = [
            "id",
            "nom",
            "description",
            "est_actif",
            "en_panne",
            "type_evenement",
            "date_debut",
            "position",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        # On filtre par type 'evenement'
        logs = HistoriqueObjet.objects.filter(
            type_objet="evenement", objet_id=obj.id
        ).order_by("-date_mesure")[:10]
        return HistoriqueTechniqueSerializer(logs, many=True).data


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = "__all__"

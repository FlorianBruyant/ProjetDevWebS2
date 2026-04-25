from rest_framework import serializers
from users.models import ActionLog

from .models import (
    Evenement,
    Feu,
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
        # On crée une copie modifiable des données reçues
        mutable_data = data.copy() if hasattr(data, "copy") else dict(data)

        zone_data = mutable_data.get("zone")

        # Si la zone est du texte (ex: "Quartier Nord") et pas un ID
        if (
            isinstance(zone_data, str)
            and not zone_data.isdigit()
            and zone_data.strip() != ""
        ):
            # On cherche la zone, ou on la crée si elle n'existe pas
            nouvelle_zone, created = Zone.objects.get_or_create(nom=zone_data.strip())
            # On remplace le texte par l'ID (DRF sera content !)
            mutable_data["zone"] = nouvelle_zone.id

        # Si on a vidé le champ zone
        elif zone_data == "":
            mutable_data["zone"] = None

        return super().to_internal_value(mutable_data)


# --- Sérialiseur pour l'historique (Stats) ---
class ActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        fields = ["action", "date", "points_gagnes"]


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
            "immatriculation",
            "vitesse",
            "est_actif",
            "en_panne",
            "point_actuel",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


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
            "etat_actuel",
            "temps_avant_changement",
            "position",
            "point_actuel_details",
            "est_actif",
            "en_panne",
            "description",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


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
            "places_occupees",
            "places_totales",
            "position",
            "point_actuel_details",
            "zone",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


class LieuInteretSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    # On utilise la même clé 'point_actuel_details' pour la compatibilité Front-end
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="lieux")

    class Meta:
        model = LieuInteret
        fields = [
            "id",
            "nom",
            "categorie",
            "position",
            "point_actuel_details",
            "zone",
            "description",
            "site_web",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        # On adapte la recherche de log pour le type Lieu
        logs = ActionLog.objects.filter(action__contains=f"Lieu ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


class EvenementSerializer(ZoneToleranteMixin, serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()
    type_api = serializers.ReadOnlyField(default="evenements")

    class Meta:
        model = Evenement
        fields = [
            "id",
            "nom",
            "type_evenement",
            "date_debut",
            "position",
            "point_actuel_details",
            "zone",
            "description",
            "historique",
            "type_api",
        ]

    def get_historique(self, obj):
        # On adapte la recherche de log pour le type Evenement
        logs = ActionLog.objects.filter(
            action__contains=f"Evénement ID: {obj.id}"
        ).order_by("-date")[:5]
        return ActionLogSerializer(logs, many=True).data


class ScenarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Scenario
        fields = "__all__"

from rest_framework import serializers
from users.models import ActionLog

from .models import Feu, Parking, Point, Vehicule, Zone


# --- Sérialiseur pour l'historique (Stats) ---
class ActionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        # 👇 Utilisation du champ 'date' (vu dans tes logs d'erreur)
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
class VehiculeSerializer(serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="point_actuel", read_only=True)
    historique = serializers.SerializerMethodField()

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
            "historique",
        ]

    def get_historique(self, obj):
        # On cherche les actions liées à cet ID. Tri par 'date'
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


# --- Sérialiseur pour les Feux ---
class FeuSerializer(serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()

    class Meta:
        model = Feu
        fields = [
            "id",
            "nom",
            "etat_actuel",
            "temps_avant_changement",
            "position",  # 👈 LA CORRECTION EST ICI ! On autorise l'enregistrement de la position.
            "point_actuel_details",
            "est_actif",
            "en_panne",
            "description",
            "historique",
        ]

    def get_historique(self, obj):
        # Tri par 'date'
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data


# --- Sérialiseur pour les Parkings ---
class ParkingSerializer(serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    historique = serializers.SerializerMethodField()

    class Meta:
        model = Parking
        fields = [
            "id",
            "nom",
            "places_occupees",
            "places_totales",
            "position",
            "point_actuel_details",
            "historique",
        ]

    def get_historique(self, obj):
        # Tri par 'date'
        logs = ActionLog.objects.filter(action__contains=f"ID: {obj.id}").order_by(
            "-date"
        )[:5]
        return ActionLogSerializer(logs, many=True).data

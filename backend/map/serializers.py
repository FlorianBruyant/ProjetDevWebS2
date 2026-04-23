from rest_framework import serializers

from .models import Feu, Parking, Point, Vehicule, Zone


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"


class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = "__all__"


# --- Sérialiseur pour les Véhicules ---
class VehiculeSerializer(serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="point_actuel", read_only=True)
    type_objet = serializers.ReadOnlyField(default="VEHICULE")

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
            "type_objet",
        ]


# --- Sérialiseur pour les Feux ---
class FeuSerializer(serializers.ModelSerializer):
    # On utilise le même nom que pour les véhicules pour ne pas perdre React
    point_actuel_details = PointSerializer(source="position", read_only=True)
    type_objet = serializers.ReadOnlyField(default="FEU")

    class Meta:
        model = Feu
        fields = [
            "id",
            "nom",
            "etat_actuel",
            "est_actif",
            "en_panne",
            "position",
            "point_actuel_details",
            "type_objet",
        ]


# --- Sérialiseur pour les Parkings ---
class ParkingSerializer(serializers.ModelSerializer):
    point_actuel_details = PointSerializer(source="position", read_only=True)
    type_objet = serializers.ReadOnlyField(default="PARKING")

    class Meta:
        model = Parking
        fields = [
            "id",
            "nom",
            "places_occupees",
            "places_totales",
            "position",
            "point_actuel_details",
            "type_objet",
        ]

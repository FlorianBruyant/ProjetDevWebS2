from rest_framework import serializers

from .models import Point, Vehicule, Zone


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"  # On traduit toutes les cases de la fiche


class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = "__all__"


class VehiculeSerializer(serializers.ModelSerializer):
    # On veut aussi voir les détails du point où se trouve la voiture
    point_actuel_details = PointSerializer(source="point_actuel", read_only=True)

    class Meta:
        model = Vehicule
        fields = [
            "id",
            "nom",
            "immatriculation",
            "vitesse",
            "est_actif",
            "point_actuel",
            "point_actuel_details",
        ]

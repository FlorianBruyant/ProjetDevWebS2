from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets
from rest_framework.permissions import AllowAny  # <-- On change pour "AllowAny"

from .models import Vehicule, Zone
from .serializers import VehiculeSerializer, ZoneSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["est_actif", "en_panne", "point_actuel__zone"]

    # On autorise tout le monde le temps de vérifier que les filtres marchent
    permission_classes = [AllowAny]

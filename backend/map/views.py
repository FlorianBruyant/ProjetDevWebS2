from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets

#  on importe notre gestionnaire de permission
from users.permissions import IsAdminOrReadOnly

from .models import Vehicule, Zone
from .serializers import VehiculeSerializer, ZoneSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer
    # On protège aussi les zones
    permission_classes = [IsAdminOrReadOnly]


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer

    filter_backends = [DjangoFilterBackend]
    filterset_fields = ["est_actif", "en_panne", "point_actuel__zone"]

    # --- SÉCURITÉ PAR RÔLE ---
    # Public en lecture, Admin uniquement pour l'ajout/modif
    permission_classes = [IsAdminOrReadOnly]

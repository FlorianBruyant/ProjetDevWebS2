from rest_framework import viewsets

from .models import Vehicule, Zone
from .serializers import VehiculeSerializer, ZoneSerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer


class VehiculeViewSet(viewsets.ModelViewSet):
    queryset = Vehicule.objects.all()
    serializer_class = VehiculeSerializer

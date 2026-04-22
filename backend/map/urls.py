from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import VehiculeViewSet, ZoneViewSet

router = DefaultRouter()
router.register(r"zones", ZoneViewSet)
router.register(r"vehicules", VehiculeViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

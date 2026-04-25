from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"zones", views.ZoneViewSet)
router.register(r"vehicules", views.VehiculeViewSet)
router.register(r"feux", views.FeuViewSet)
router.register(r"parkings", views.ParkingViewSet)
router.register(r"points", views.PointViewSet)
router.register(r"lieux", views.LieuInteretViewSet)
router.register(r"evenements", views.EvenementViewSet)
# 👇 AJOUT DE L'ENDPOINT SCENARIOS
router.register(r"scenarios", views.ScenarioViewSet, basename="scenario")

urlpatterns = [
    path("", include(router.urls)),
    path("horaires/", views.get_horaires_gare),
    path("global/", views.get_global_data),
    path("consulter/<int:objet_id>/", views.consulter_objet),
    path("analytics/", views.get_analytics),
]

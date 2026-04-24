from django.contrib import admin

from .models import Feu, Incident, Parking, Point, Route, Scenario, Vehicule, Zone

# On enregistre tous nos modèles pour pouvoir les gérer
admin.site.register(Zone)
admin.site.register(Point)
admin.site.register(Feu)
admin.site.register(Parking)
admin.site.register(Vehicule)
admin.site.register(Route)
admin.site.register(Incident)


# 👇 C'est cette ligne qui te manque pour voir les scénarios !
@admin.register(Scenario)
class ScenarioAdmin(admin.ModelAdmin):
    list_display = (
        "nom",
        "categorie",
        "declencheur_champ",
        "operateur",
        "valeur_seuil",
        "est_actif",
    )
    list_filter = ("categorie", "est_actif")

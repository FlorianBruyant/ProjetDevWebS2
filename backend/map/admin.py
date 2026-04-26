from django.contrib import admin

from .models import (
    AlerteObjet,
    Feu,
    HistoriqueObjet,
    Incident,
    Parking,
    Point,
    RegleAlerte,
    Route,
    Scenario,
    Vehicule,
    Zone,
)

# On enregistre tous nos modèles pour pouvoir les gérer
admin.site.register(Zone)
admin.site.register(Point)
admin.site.register(Feu)
admin.site.register(Parking)
admin.site.register(Vehicule)
admin.site.register(Route)
admin.site.register(Incident)
admin.site.register(RegleAlerte)


@admin.register(AlerteObjet)
class AlerteObjetAdmin(admin.ModelAdmin):
    list_display = (
        "declenchee_le",
        "type_objet",
        "objet_id",
        "niveau",
        "statut",
        "zone",
    )
    list_filter = ("type_objet", "niveau", "statut", "zone")
    search_fields = ("type_objet", "objet_id", "message")


@admin.register(HistoriqueObjet)
class HistoriqueObjetAdmin(admin.ModelAdmin):
    # Liste des colonnes affichées dans le tableau
    list_display = (
        "date_mesure",
        "type_objet",
        "objet_id",
        "consommation_kwh",
        "est_en_panne",
    )

    # Filtres sur le côté droit
    list_filter = ("type_objet", "est_en_panne", "date_mesure")

    # Barre de recherche
    search_fields = ("type_objet", "objet_id")


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

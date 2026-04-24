from django.db.models.signals import post_save
from django.dispatch import receiver

from .logic import executer_scenarios_trafic
from .models import Feu, Incident, Vehicule

# Variable temporaire pour éviter la boucle infinie
_en_cours_de_traitement = False


@receiver(post_save, sender=Feu)
@receiver(post_save, sender=Vehicule)
@receiver(post_save, sender=Incident)
def trigger_scenarios(sender, instance, created, **kwargs):
    global _en_cours_de_traitement

    if kwargs.get("raw") or _en_cours_de_traitement:
        return

    try:
        _en_cours_de_traitement = True
        executer_scenarios_trafic(instance)
    finally:
        _en_cours_de_traitement = False

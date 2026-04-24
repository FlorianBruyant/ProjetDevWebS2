def executer_scenarios_trafic(objet_modifie):
    # Imports locaux pour éviter les erreurs de chargement circulaire
    from .models import Feu, Incident, Scenario, Vehicule

    # 1. On récupère les scénarios actifs
    scenarios = Scenario.objects.filter(est_actif=True)
    if not scenarios.exists():
        return

    # 2. Sécurité : On récupère la zone. Si pas de zone, on ne peut pas
    # appliquer de logique géographique.
    zone = getattr(objet_modifie, "zone", None)

    for s in scenarios:
        try:
            # --- SCÉNARIO TYPE : PRIORITÉ BUS (TRAFFIC) ---
            if s.categorie == "TRAFFIC" and isinstance(objet_modifie, Vehicule):
                # On vérifie si c'est un Bus et s'il est lent
                is_bus = getattr(objet_modifie, "type_objet", "") == "Bus"
                vitesse = getattr(objet_modifie, "vitesse", 100)

                # On compare avec la valeur seuil du scénario (ex: 15)
                if is_bus and vitesse < float(s.valeur_seuil) and zone:
                    # .update() est CRUCIAL ici : il change la BDD sans
                    # déclencher le signal save(), évitant la boucle infinie.
                    Feu.objects.filter(zone=zone).update(etat_actuel="VERT")
                    print(f"🚦 [Auto] Priorité Bus activée pour la zone : {zone.nom}")

            # --- SCÉNARIO TYPE : SÉCURITÉ (SAFETY) ---
            elif s.categorie == "SAFETY" and isinstance(objet_modifie, Incident):
                # Si l'incident est grave (gravité > seuil)
                if objet_modifie.gravite >= int(s.valeur_seuil) and zone:
                    Feu.objects.filter(zone=zone).update(etat_actuel="ROUGE")
                    print(f"🚨 [Auto] Zone {zone.nom} sécurisée (Incident grave)")

            # --- SCÉNARIO TYPE : MAINTENANCE ---
            elif s.categorie == "MAINTENANCE":
                # On vérifie le niveau de batterie
                batterie = getattr(objet_modifie, "niveau_batterie", None)
                if batterie is not None and batterie < float(s.valeur_seuil):
                    # On met l'objet en panne
                    type(objet_modifie).objects.filter(id=objet_modifie.id).update(
                        en_panne=True
                    )
                    print(
                        f"🔧 [Auto] {objet_modifie.nom} envoyé en maintenance (Batterie faible)"
                    )

        except Exception as e:
            # On log l'erreur pour débugger, mais on ne crash pas le serveur
            print(f"⚠️ Erreur lors de l'exécution du scénario '{s.nom}': {e}")

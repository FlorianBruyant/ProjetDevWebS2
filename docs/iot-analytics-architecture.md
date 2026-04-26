# Module IoT Analytics, Monitoring et Reporting

## 1. Architecture cible

La base actuelle du projet s'appuie sur Django avec des objets IoT specialises (`Feu`, `Parking`, `Vehicule`, `LieuInteret`, `Evenement`) et une table d'historique transverse `HistoriqueObjet`.

Pour couvrir le besoin sans casser l'existant, la meilleure approche est :

- Conserver les tables metier actuelles pour les objets connectes.
- Centraliser les mesures temporelles dans `HistoriqueObjet`.
- Ajouter une couche de regles avec `RegleAlerte`.
- Ajouter une couche d'evenements metier avec `AlerteObjet`.

## 2. Schema recommande

### Tables coeur

- `zone`
  Utilisee pour les filtres geographiques et l'agregation.

- `feu`, `parking`, `vehicule`, `lieu_interet`, `evenement`
  Tables des objets connectes avec leur etat courant.

- `historique_objet`
  Usage :
  stockage temporel des consommations, pannes, frequentations et metriques d'exploitation.
  Index critiques :
  `type_objet + objet_id`, `date_mesure`.

- `regle_alerte`
  Usage :
  parametrer les seuils par type d'objet et, si besoin, par zone.
  Champs clefs :
  `seuil_surconsommation`, `seuil_absolu_kwh`, `fenetre_analyse_heures`, `echantillons_minimum`, `cooldown_minutes`.

- `alerte_objet`
  Usage :
  historiser les anomalies detectees et leur cycle de vie.
  Champs clefs :
  `code`, `niveau`, `statut`, `valeur_mesuree`, `valeur_reference`, `ecart_percent`, `contexte`.

## 3. Logique de calcul recommandee

- L'objet garde son etat temps reel dans sa table principale.
- Les analyses se basent sur l'historique recent sur une fenetre glissante.
- Une alerte n'est creee que si :
  la consommation courante depasse un ratio de la moyenne historique
  et l'ecart absolu depasse un seuil minimal.
- Un cooldown evite les doublons d'alertes sur le meme objet.

## 4. Evolution conseillee

Pour une volumetrie IoT plus forte, il sera pertinent de :

- migrer vers PostgreSQL en production avec partitionnement temporel sur `historique_objet`
- denormaliser `zone_id` dans l'historique pour accelerer les rapports par zone
- ajouter une table `snapshot_reporting` si des exports lourds doivent etre mis en cache
- brancher `alerte_objet` sur email, websocket ou file de messages pour le temps reel

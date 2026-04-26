Rapport d'Analyse Complète du Backend
1. Vue d'ensemble et Architecture Globale
Technologies utilisées :

Langage : Python 3
Framework Web : Django (pour la structure) & Django REST Framework (DRF) (pour l'API)
Base de Données : SQLite (db.sqlite3), base de données relationnelle locale.
Concurrence : Module threading standard pour le scrapping asynchrone.
Flux de données (Data Flow) et Logique métier :

Récupération (Scrapping) : Des scripts indépendants interrogent des API tierces (ex: Paris Open Data) pour récupérer l'état des feux, parkings, vélos, et bus.
Peuplement & Traitement : Ces données sont nettoyées puis insérées en base de données via l'ORM Django (Objets Vehicule, Feu, Parking, etc.).
Surveillance active : Des algorithmes de détection d'anomalies analysent l'historique de consommation de ces objets (ex: consommation énergétique) et génèrent des AlerteObjet si un seuil est franchi. Ce processus est optimisé par l'utilisation de "Signaux" Django (signals.py) pour agir de manière réactive.
Exposition REST API : Le frontend React requête le backend via des points d'accès (Endpoints). Les serializers s'occupent de transformer la data des objets de la base SQLite en JSON.
Utilisateurs : Un système d'authentification gère les utilisateurs de la plateforme, avec la journalisation de leurs actions (ActionLog) et un potentiel système de niveaux.
2. Analyse Fichier par Fichier
📂 Dossier Racine (Scripts d'Extraction & Commandes)
Fichier : reset_and_scrapp.py
Rôle : Contrôleur principal pour initialiser l'environnement. Supprime les données obsolètes et lance les différents scrappers en parallèle.
Fonctions :

- clear_total :
Entrée : Aucune.
Traitement : Utilise l'ORM Django pour effectuer un .delete() massif sur toutes les tables de l'application map.
Sortie : Base de données vierge.
- lancer_scrapping_global :
Entrée : Aucune.
Traitement : Crée et démarre 3 threads distincts pointant vers les fonctions de récupération (feux, parkings, vélos) pour optimiser le temps réseau.
Sortie : Base de données peuplée.
- generer_incidents_initiaux :
Entrée : nombre (int, par défaut 3).
Traitement : Sélectionne aléatoirement des objets existants (feux/parkings) et génère des objets Evenement (incidents factices) à proximité.
Sortie : Création d'événements en DB.
- demarrer_simulation_live :
Entrée : Aucune.
Traitement : Appel asynchrone / bloquant de la commande Django simulateur_live.
Sortie : Maintien de l'environnement actif.
Fichiers : recuperateur_feux.py, recuperateur_parking.py, recuperateur_velos.py, recuperateur_horaires_bus.py
Rôle : Scripts dédiés à l'interrogation d'API externes spécifiques et au formatage de la donnée.
Fonctions clés :

- importer_feux / maj_parkings_ouvrage / maj_carte_en_temps_reel / lire_panneau_affichage :
Entrée : Appels HTTP REST vers des données OpenData.
Traitement : Parsing asynchrone du JSON récupéré, vérification de la présence d'une donnée existante, mise à jour ou création de l'objet (via l'ORM Django).
Sortie : Données fraîches enregistrées en SQLite.
📂 Application map (Cœur cartographique et Infrastructure)
Fichier : map/models.py
Rôle : Définition des schémas de la base de données. Contient toutes les classes représentant la ville.
Fonctions (Méthodes de classe) :

- TrafficObject.determiner_zone_auto :
Entrée : Instance de l'objet.
Traitement : Calcule avec des coordonnées spatiales à quelle Zone appartient l'objet.
Sortie : L'instance Zone la plus proche.
- [Classe].save (Surchargées pour Vehicule, Feu, Parking) :
Entrée : Données de l'objet prêt à être sauvegardé.
Traitement : Intercepte la sauvegarde pour attribuer automatiquement la zone via determiner_zone_auto avant de commit en DB.
Sortie : Objet enregistré.
Fichier : map/services/detection_anomalies.py
Rôle : Contient la logique d'Intelligence d'Affaire pour repérer les surconsommations et problèmes. Séparé des Views pour alléger le code principal.
Fonctions :

- recuperer_objet & determiner_type_objet :
Entrée : type_objet (string), objet_id (int).
Traitement : Switch/case (dictionnaire Python) pour récupérer l'intance correcte sans faire de if/else inutiles.
Sortie : Instance du modèle Django.
- analyser_anomalie_consommation :
Entrée : instance matérielle, consommation_actuelle.
Traitement : Récupère la RegleAlerte de l'objet. Lance une aggrégation .aggregate(moyenne=Avg("consommation_kwh")) sur l'historique récent de ce matériel. Compare à la demande actuelle.
Sortie : Dataclass ResultatAnomalieConsommation.
- declencher_alerte_consommation :
Entrée : Instance matérielle, ResultatAnomalieConsommation.
Traitement : Vérifie la présence de doublons d’alerte sur les XX dernières minutes (Mécanique Anti-Spam / Cooldown). Si OK, crée et enregistre l'Alerte en base .
Sortie : Objet AlerteObjet ou None.
Fichier : map/signals.py & map/logic.py
Rôle : Écoute les actions sur la DB (Insert/Update) et déclenche des événements collatéraux.
Fonctions :

- trigger_scenarios (signaux) :
Entrée : Signal post_save (lorsqu'un incident se crée).
Traitement : Route la requête vers executer_scenarios_trafic.
Sortie : Aucune.
- executer_scenarios_trafic (logic) :
Entrée : Événements contextuels.
Traitement : Applique des règles métiers (Ex: un accident ralentit le trafic, donc modifie la vitesse des véhicules autour).
Sortie : Mise à jour des objets impactés.
Fichier : map/serializers.py
Rôle : Formater les objets Complexes Python / SQLite vers du JSON pur pour l'API REST.
Fonctions :

- get_historique (Sur Véhicule, Feu, etc) :
Entrée : Instance courante transmise par la requète.
Traitement : Interroge la table HistoriqueObjet pour cet élément précis.
Sortie : Liste JSON des 10 dernières data de consommation de l'élément ciblé.
Fichier : map/views.py et map/analytics_views.py
Rôle : Portes d'entrée HTTP (Endpoints API).
Fonctions :

- get_queryset (Dans chaque ressource ViewSet) :
Entrée : L'objet request HTTP contenant des URL Params (?zone=id).
Traitement : Filtre dynamiquement les requêtes objects.all() en fonction de ce qui est demandé.
Sortie : Queryset Django affiné.
- get_global_data :
Entrée : Objet request HTTP GET.
Traitement : Compile dans un gigantesque JSON l'intégralité des véhicules, feux, parkings et événements actifs.
Sortie : Response JSON massive.
- get_analytics :
Entrée : Paramètres temporels et zone ciblée.
Traitement : Fait appel au moteur d'agrégation d'anomalies et résume les métriques pour tracer les graphes front-end.
Sortie : Response JSON d'anomalies condensées.
Fichier : map/management/commands/simulateur_live.py (etc.)
Rôle : Intégration de scripts personnalisés accessibles via python manage.py ....
Fonctions :

- Command.handle : Boucle infinie exécutant de la mise à jour aléatoire et chronométrée pour feindre l'activité (déplacement des voitures, changement des feux).
📂 Application users (Gestion de l'Authentification)
Fichier : users/models.py
Rôle : Gérer l'entité humaine connectée et sa gamification.
Fonctions :

- CustomUser.verifier_et_mettre_a_jour_niveau :
Entrée : Variables de gamification du profil (points_gagnes, date_derniere_action).
Traitement : Calcule si la personne franchit un pallier en fonction des points récupérés sur la plateforme.
Sortie : Met à jour attribut niveau profil.
- log_user_login :
Entrée : Signal user_logged_in natif à Django.
Traitement : Trace en BDD (ActionLog) chaque connexion, IP et date, pour du suivi analytique.
Fichier : users/views.py
Rôle : Expose les endpoints de récupération de mots de passe, création de compte et accès profil.
Fonctions :

- envoyer_confirmation_email :
Entrée : Instance 'user', Code/Token généré.
Traitement : Construit et envoie asynchronement l'email de validation via le SMTP de Django.
Sortie : booléen réussite d'envoi.
- ActivateAccountView.get / PasswordReset* : Exécute le CRUD natif pour la gestion des mots de passe oubliés.
Fichier : users/permissions.py
Rôle : Sécurise l'API. (Qui a le droit d'effectuer des POST/PUT/DELETE).
Fonctions :

- IsAdminOrReadOnly.has_permission :
Entrée : API Request.
Traitement : Vérifie que le endpoint n'est modifié en écriture que si le user HTTP courant est is_staff.
Sortie : Booléen Autorisation.
📂 Application api
Fichiers : api/models.py, api/views.py, etc.
Rôle : Actuellement un dossier coquille presque vide ou servant de point central de routage pour rassembler l'API V1 globale. Il exporte très probablement le routing principal. Seule une fonction dummy test ressort dans les parcours.

🎯 Constatations & Pistes d'Optimisation
Goulot d'étranglement de l'API (get_global_data dans map/views.py) : Charger toute la ville en un point va paralyser le serveur et le front quand la base grossira. Conseil : Utiliser des Bounding Box spatiales (renvoyer uniquement les data présentes sur la portion de carte affichée sur l'écran frontend de l'utilisateur).
Séparation Modèles / Services : Excellente structure ! Déplacer le code d'anomalie en dehors du modèle Feu ou Parking (services/detection_anomalies.py) respecte parfaitement les principes SOLID.
Traitement Asynchrone : L'utilisation de signaux (post_save dans map/signals.py) pour la gestion des "scénarios d'impacts" est puissante, mais elle est dite "synchrone" en Django par défaut. Créer une voiture bloque pendant l'exécution de la règle. 

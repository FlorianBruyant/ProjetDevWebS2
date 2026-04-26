# 🏗️ Rapport d'Analyse Complète du Backend

## 1. Vue d'ensemble et Architecture Globale

**Technologies utilisées :**
*   **Langage :** Python 3
*   **Framework Web :** Django (pour la structure) & Django REST Framework (DRF) (pour l'API)
*   **Base de Données :** SQLite (`db.sqlite3`), base de données relationnelle locale.
*   **Concurrence :** Module `threading` standard pour le scrapping asynchrone.

**Flux de données (Data Flow) et Logique métier :**
1.  **Récupération (Scrapping) :** Des scripts indépendants interrogent des API tierces (ex: Paris Open Data) pour récupérer l'état des feux, parkings, vélos, et bus.
2.  **Peuplement & Traitement :** Ces données sont nettoyées puis insérées en base de données via l'ORM Django (Objets `Vehicule`, `Feu`, `Parking`, etc.).
3.  **Surveillance active :** Des algorithmes de détection d'anomalies analysent l'historique de consommation de ces objets (ex: consommation énergétique) et génèrent des `AlerteObjet` si un seuil est franchi. Ce processus est optimisé par l'utilisation de "Signaux" Django (`signals.py`) pour agir de manière réactive.
4.  **Exposition REST API :** Le frontend requête le backend via des points d'accès (Endpoints). Les serializers s'occupent de transformer la data des objets de la base SQLite en JSON.
5.  **Utilisateurs :** Un système d'authentification gère les utilisateurs de la plateforme, avec la journalisation de leurs actions (`ActionLog`) et un potentiel système de niveaux.

---

## 2. Analyse Fichier par Fichier

### 📂 Dossier Racine (Scripts d'Extraction & Commandes)

**Fichier : `reset_and_scrapp.py`**
*   **Rôle :** Contrôleur principal pour initialiser l'environnement. Supprime les données obsolètes et lance les différents scrappers en parallèle.
*   **Fonctions :**
    *   `clear_total` : Vide les tables majeures de l'application via l'ORM Django.
    *   `lancer_scrapping_global` : Crée et démarre des `threads` pour exécuter les récupérations d'API en parallèle.
    *   `generer_incidents_initiaux` : Sélectionne aléatoirement des objets pour générer de faux événements (simulations de bugs).
    *   `demarrer_simulation_live` : Fait appel à une commande Django pour démarrer la boucle infinie de simulation en temps réel.

**Fichiers : `recuperateur_feux.py`, `recuperateur_parking.py`, `recuperateur_velos.py`, `recuperateur_horaires_bus.py`**
*   **Rôle :** Scripts dédiés à l'interrogation d'API externes spécifiques et au formatage de la donnée avant insertion.
*   **Fonctions clés :** `importer_feux`, `maj_parkings_ouvrage`, `maj_carte_en_temps_reel`, `lire_panneau_affichage` ciblent les API, formatent la donnée, et sauvent les objets spatialement en base de données.

---

### 📂 Application `map` (Cœur cartographique et Infrastructure)

**Fichier : `map/models.py`**
*   **Rôle :** Définition des entités de la base de données (Zones, Feux, Parkings, Alertes, Événements).
*   **Fonctions (Méthodes) :**
    *   `TrafficObject.determiner_zone_auto` : Calcule avec des coordonnées spatiales à quelle `Zone` appartient l'objet.
    *   `.save()` (Surchargées) : Applique automatiquement la zone lors de l'enregistrement de l'objet en BDD.

**Fichier : `map/services/detection_anomalies.py`**
*   **Rôle :** Logique métier complexe pour repérer les surconsommations par le croisement de données historiques et actuelles.
*   **Fonctions :**
    *   `determiner_type_objet` / `recuperer_objet` : Fonctions utilitaires d'identification.
    *   `analyser_anomalie_consommation` : Effectue une aggrégation (`Avg`) sur l'historique récent de la base et évalue par rapport à une Règle d'alerte définie.
    *   `declencher_alerte_consommation` : Intègre un système de délai ("cooldown") pour éviter le spam, puis crée un objet `AlerteObjet` si tout est réuni en cas de crise.

**Fichier : `map/signals.py` & `map/logic.py`**
*   **Rôle :** Déclencheurs automatiques lors de modifications de la base de données.
*   **Fonctions :**
    *   `trigger_scenarios` : Écoute les signaux `post_save` des objets comme les Événements ou Incidents.
    *   `executer_scenarios_trafic` : Modifie les métriques environnementales (ex: ralentit le mouvement théorique des voitures suite à un incident).

**Fichier : `map/serializers.py`**
*   **Rôle :** Convertit les objets complexes Python/SQLite en formats lisibles (JSON) pour le rendu réseau.
*   **Fonctions :**
    *   `get_historique` : Interroge `HistoriqueObjet` pour chaque ressource et rattache la timeline des consommations à la réponse JSON finale.

**Fichier : `map/views.py` et `map/analytics_views.py`**
*   **Rôle :** Points d'entrée (Endpoints) de l'API.
*   **Fonctions :**
    *   `get_queryset` : Filtre la réponse via des Query params (ex: via un Id de `Zone` précis).
    *   `get_global_data` : Retourne la quasi-globalité de la BDD pour le rendu de la carte côté frontend.
    *   `get_analytics` : Point dédié aux calculs d'interface et KPI (indicateurs de performance).

**Fichier : `map/management/commands/simulateur_live.py`**
*   **Rôle :** Lancer et maintenir une boucle infinie de modifications de données (simulateur de trafic urbain).

---

### 📂 Application `users` (Système d'Authentification & Profils)

**Fichier : `users/models.py`**
*   **Rôle :** Redéfinit `AbstractUser` pour l'adapter au contexte (gestion des niveaux, points de gamification).
*   **Fonctions :**
    *   `CustomUser.verifier_et_mettre_a_jour_niveau` : Permet la progression de l'utilisateur (niveaux et badges) en fonction de ses actions.
    *   `log_user_login` : (Signal Django) Historise et sécurise les connexions entrantes avec estampille temporelle.

**Fichier : `users/views.py`**
*   **Rôle :** Vues DRF standard pour gérer la création de compte, connexion, le profil, le reset mot de passe.
*   **Fonctions :**
    *   `envoyer_confirmation_email` : Outil basique de génération asynchrone d'email de confirmation SMTP.

**Fichier : `users/permissions.py`**
*   **Rôle :** Assure la sécurité aux endpoints (Vérifie "qui" a le droit de faire une requête POST/PUT/DELETE).

---

### 📂 Application `api`

*   **Rôle :** Routeur global pour l'API REST v1, regroupant les différentes URLs des autres applications.

---

## 🎯 Recommandations & Optimisations Possibles

1.  **Goulot d'étranglement avec `get_global_data` (map/views.py) :** 
    Charger tout le backend en une seule requête va ralentir considérablement les performances une fois la quantité de trafic ou de véhicules élevée.
    *   *Solution :* Envisager une API à base de "Bounding Box" qui interroge et retourne exclusivement les entités contenues dans le périmètre géographique de la carte côté frontend.
2.  **Passage en file d'attente pour les Signaux (map/signals.py) :** 
    Les signaux Django (`post_save`) ralentissent la boucle de sauvegarde s'ils lancent des algorithmes longs, car ils sont exécutés dans le même cycle synchrone.
    *   *Solution :* Décharger les calculs lourds ou envois d'e-mails via des tâches d'arrière-plan (Tasks Queues) en employant *Celery* avec Redis ou RabbitMQ.
3.  **Gestion asynchrone des réseaux (Scripts de scraping) :**
    Si la fréquence requise pour faire les appels réseaux des scrappeurs devient critique, préférez `asyncio` (`aiohttp`) à la place de la syntaxe multi-threads classique `threading` qui est parfois plus lourde pour l'OS.
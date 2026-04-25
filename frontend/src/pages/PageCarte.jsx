import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Carte from '../components/Carte';
import BarreRecherche from '../components/BarreRecherche';
import AjoutObjet from '../components/AjoutObjet';

const PageCarte = () => {
    const location = useLocation();

    // --- ÉTATS RECHERCHE ---
    const [donneesMap, setDonneesMap] = useState([]);
    const [termeFixe, setTermeFixe] = useState('');
    const [chargement, setChargement] = useState(false);
    const [aucunResultat, setAucunResultat] = useState(false);
    const [rechercheActive, setRechercheActive] = useState(() => location.state?.focusRecherche ?? false);
    const [recherche, setRecherche] = useState(() => location.state?.texteInitial ?? '');
    const [categorieActuelle, setCategorieActuelle] = useState('global');
    const inputRef = useRef(null);

    // --- ÉTATS AJOUT D'OBJET ---
    const [isAdmin, setIsAdmin] = useState(false);
    const [modeAjout, setModeAjout] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [coordsSelectionnees, setCoordsSelectionnees] = useState(null);
    const [nouveauObjet, setNouveauObjet] = useState({
        type_api: 'feux',
        nom: '',
        description: '',
        details: '',
    });
    const [doitCentrer, setDoitCentrer] = useState(true);

    // --- ÉTATS ZONES ---
    const [zones, setZones] = useState([]);
    const [zoneSelectionnee, setZoneSelectionnee] = useState('');

    // --- VÉRIFICATION DU RÔLE ---
    useEffect(() => {
        const verifierRole = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            try {
                const res = await fetch('http://localhost:8000/api/me/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data = await res.json();
                    setIsAdmin(data.role === 'ADMIN');
                }
            } catch (err) {
                console.error('Erreur vérification rôle:', err);
            }
        };
        verifierRole();
    }, []);

    // --- CHARGEMENT DES ZONES ---
    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/map/zones/');
                const data = await res.json();
                setZones(Array.isArray(data) ? data : data.results || []);
            } catch (err) {
                console.error('Erreur zones:', err);
            }
        };
        fetchZones();
    }, []);

    // --- FONCTION DE CHARGEMENT API ---
    const chargerDonnees = async (
        categorie = categorieActuelle,
        texte = recherche,
        isRefresh = false,
        zoneId = zoneSelectionnee
    ) => {
        if (!isRefresh) {
            setDoitCentrer(true);
            if (donneesMap.length === 0) setChargement(true);
        } else {
            setDoitCentrer(false);
        }

        setAucunResultat(false);
        setTermeFixe(texte);
        setCategorieActuelle(categorie);

        try {
            const endpoint = categorie === 'global' ? 'global' : categorie;
            let url = `http://localhost:8000/api/map/${endpoint}/?search=${texte}&zone=${zoneId}`;
            const response = await fetch(url);
            const data = await response.json();
            const listeFinale = Array.isArray(data) ? data : data.results || [];

            setDonneesMap(listeFinale);

            if (listeFinale.length === 0 && texte !== '') setAucunResultat(true);
        } catch (error) {
            console.error('Erreur API Carte:', error);
            setDonneesMap([]);
        } finally {
            setChargement(false);
        }
    };

    // --- REFRESH RÉGULIER ---
    useEffect(() => {
        const intervalle = setInterval(() => {
            chargerDonnees(categorieActuelle, recherche, true, zoneSelectionnee);
        }, 5000);
        return () => clearInterval(intervalle);
    }, [categorieActuelle, recherche, zoneSelectionnee]);

    // --- FOCUS INITIAL ---
    useLayoutEffect(() => {
        if (location.state?.focusRecherche) {
            const texteInitial = location.state?.texteInitial;
            window.history.replaceState({}, document.title);
            setTimeout(() => {
                inputRef.current?.focus();
                if (texteInitial) chargerDonnees('global', texteInitial);
            }, 0);
        } else {
            chargerDonnees('global', '');
        }
    }, [location]);

    // --- GESTION DU CLIC SUR LA CARTE ---
    const handleClicCarte = latlng => {
        setCoordsSelectionnees(latlng);
        setOpenModal(true);
        setModeAjout(false);
    };

    // --- ENVOI DE L'OBJET AU BACKEND ---
    const handleCreerObjet = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // --- 1. CRÉATION DU POINT GPS ---
            const resPoint = await fetch('http://localhost:8000/api/map/points/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: coordsSelectionnees.lat,
                    longitude: coordsSelectionnees.lng,
                }),
            });

            let pointId = null;
            if (resPoint.ok) {
                const pointData = await resPoint.json();
                pointId = pointData.id;
            } else {
                console.warn("Échec création point, tentative d'envoi imbriqué...");
            }

            // --- 2. PRÉPARATION DU PAYLOAD COMMUN ---
            const payload = {
                nom: nouveauObjet.nom,
                description: nouveauObjet.description,
                est_actif: true,
                en_panne: false,
            };

            // --- 3. LOGIQUE SPÉCIFIQUE PAR TYPE (Intégration nouveaux types) ---
            if (nouveauObjet.type_api === 'vehicules') {
                payload.immatriculation = nouveauObjet.details || `BUS-${Math.floor(Math.random() * 1000)}`;
                if (pointId) payload.point_actuel = pointId;
            } else if (nouveauObjet.type_api === 'parkings') {
                payload.places_totales = parseInt(nouveauObjet.details) || 100;
                payload.places_occupees = 0;
                if (pointId) payload.position = pointId;
            } else if (nouveauObjet.type_api === 'lieux') {
                // On utilise 'sous_type' pour la catégorie du lieu (musée, parc...)
                payload.categorie = nouveauObjet.sous_type;
                payload.site_web = nouveauObjet.site_web || '';
                if (pointId) payload.position = pointId;
            } else if (nouveauObjet.type_api === 'evenements') {
                // On utilise 'sous_type' pour le type d'événement (festival, marché...)
                payload.type_evenement = nouveauObjet.sous_type;
                payload.date_debut = nouveauObjet.date_debut; // Format ISO string attendu par Django
                if (pointId) payload.position = pointId;
            } else {
                // Cas par défaut (ex: feux)
                if (pointId) payload.position = pointId;
            }

            // --- 4. ENVOI À L'API FINALE ---
            const res = await fetch(`http://localhost:8000/api/map/${nouveauObjet.type_api}/`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setOpenModal(false);
                // On remet à zéro tous les champs, y compris les nouveaux
                setNouveauObjet({
                    type_api: 'feux',
                    nom: '',
                    description: '',
                    details: '',
                    sous_type: '',
                    site_web: '',
                    date_debut: '',
                });
                chargerDonnees();
            } else {
                const errorMsg = await res.json();
                console.error('Erreur lors de la création', errorMsg);
                alert(`Erreur: ${JSON.stringify(errorMsg)}`);
            }
        } catch (err) {
            console.error('Erreur réseau:', err);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'white',
            }}>
            <AjoutObjet
                isAdmin={isAdmin}
                modeAjout={modeAjout}
                setModeAjout={setModeAjout}
                openModal={openModal}
                setOpenModal={setOpenModal}
                nouveauObjet={nouveauObjet}
                setNouveauObjet={setNouveauObjet}
                handleCreerObjet={handleCreerObjet}
            />

            {/* LA CARTE */}
            <Box
                sx={{
                    flex: 1,
                    zIndex: 0,
                    filter: rechercheActive ? 'blur(2px)' : 'none',
                    transition: 'filter 0.3s',
                }}>
                <Carte donnees={donneesMap} enModeAjout={modeAjout} auClicCarte={handleClicCarte} doitCentrer={doitCentrer} />
            </Box>

            <BarreRecherche
                recherche={recherche}
                setRecherche={setRecherche}
                rechercheActive={rechercheActive}
                setRechercheActive={setRechercheActive}
                categorieActuelle={categorieActuelle}
                zoneSelectionnee={zoneSelectionnee}
                setZoneSelectionnee={setZoneSelectionnee}
                zones={zones}
                chargement={chargement}
                donneesMap={donneesMap}
                aucunResultat={aucunResultat}
                termeFixe={termeFixe}
                inputRef={inputRef}
                chargerDonnees={chargerDonnees}
            />
        </Box>
    );
};

export default PageCarte;

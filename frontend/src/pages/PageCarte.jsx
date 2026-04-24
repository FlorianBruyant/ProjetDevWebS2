import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    InputAdornment,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Stack,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Alert,
} from '@mui/material';
import {
    Search,
    History,
    Close,
    DirectionsBus,
    LocalParking,
    Traffic,
    Map as MapIcon,
    Add,
    LocationOn,
} from '@mui/icons-material';
import Carte from '../components/Carte';

const PageCarte = () => {
    const location = useLocation();

    // --- ÉTATS EXISTANTS ---
    const [donneesMap, setDonneesMap] = useState([]);
    const [termeFixe, setTermeFixe] = useState('');
    const [chargement, setChargement] = useState(false);
    const [aucunResultat, setAucunResultat] = useState(false);
    const [rechercheActive, setRechercheActive] = useState(
        () => location.state?.focusRecherche ?? false,
    );
    const [recherche, setRecherche] = useState(
        () => location.state?.texteInitial ?? '',
    );
    const [categorieActuelle, setCategorieActuelle] = useState('global');
    const inputRef = useRef(null);

    // --- NOUVEAUX ÉTATS (OPTION A - AJOUT D'OBJET) ---
    const [isAdmin, setIsAdmin] = useState(false);
    const [modeAjout, setModeAjout] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [coordsSelectionnees, setCoordsSelectionnees] = useState(null);
    const [nouveauObjet, setNouveauObjet] = useState({
        type_api: 'feux',
        nom: '',
        description: '',
        details: '', // Sera utilisé pour immatriculation ou places_totales
    });
    const [doitCentrer, setDoitCentrer] = useState(true);

    // --- VÉRIFICATION DU RÔLE (Pour afficher le bouton +) ---
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

    // --- FONCTION DE CHARGEMENT API ---
    const chargerDonnees = async (
        categorie = 'global',
        texte = '',
        isRefresh = false,
    ) => {
        if (!isRefresh) {
            setDoitCentrer(true); // Autorise le recentrage pour une vraie recherche
            if (donneesMap.length === 0) setChargement(true);
        } else {
            setDoitCentrer(false); // Bloque le recentrage pour les mises à jour auto
        }

        setAucunResultat(false);
        setTermeFixe(texte);
        setCategorieActuelle(categorie);

        try {
            let url = `http://localhost:8000/api/map/${categorie === 'global' ? 'global' : categorie}/?search=${texte}`;
            const response = await fetch(url);
            const data = await response.json();

            setDonneesMap(data);
            if (data.length === 0 && texte !== '') setAucunResultat(true);
        } catch (error) {
            console.error('Erreur API Carte:', error);
        } finally {
            setChargement(false);
        }
    };

    // --- REFRESH RÉGULIER ---
    useEffect(() => {
        const intervalle = setInterval(() => {
            // On ajoute un flag "true" pour dire que c'est un refresh
            chargerDonnees(categorieActuelle, recherche, true);
        }, 5000);
        return () => clearInterval(intervalle);
    }, [categorieActuelle, recherche]);

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

    const historique = [
        'Gare de Cergy Préfecture',
        'ESSEC Business School',
        'Centre Commercial Trois Fontaines',
    ];

    // --- GESTION DU CLIC SUR LA CARTE ---
    const handleClicCarte = (latlng) => {
        setCoordsSelectionnees(latlng);
        setOpenModal(true);
        setModeAjout(false); // On quitte le mode ajout une fois cliqué
    };

    // --- ENVOI DE L'OBJET AU BACKEND ---
    const handleCreerObjet = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            // 1. On crée d'abord le Point GPS (Coordonnées)
            // Note: Si tu n'as pas de ViewSet pour les Points, on ajustera cette partie côté Backend après.
            const resPoint = await fetch(
                'http://localhost:8000/api/map/points/',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        latitude: coordsSelectionnees.lat,
                        longitude: coordsSelectionnees.lng,
                    }),
                },
            );

            let pointId = null;
            if (resPoint.ok) {
                const pointData = await resPoint.json();
                pointId = pointData.id;
            } else {
                console.warn(
                    "Échec création point, tentative d'envoi imbriqué...",
                );
                // Gérer le cas où on envoie tout d'un coup (si le backend est configuré pour)
            }

            // 2. On prépare les données de l'objet
            const payload = {
                nom: nouveauObjet.nom,
                description: nouveauObjet.description,
                est_actif: true,
                en_panne: false,
            };

            // On ajoute la position ou le point actuel selon le type
            if (nouveauObjet.type_api === 'vehicules') {
                payload.immatriculation =
                    nouveauObjet.details ||
                    `BUS-${Math.floor(Math.random() * 1000)}`;
                if (pointId) payload.point_actuel = pointId;
            } else if (nouveauObjet.type_api === 'parkings') {
                payload.places_totales = parseInt(nouveauObjet.details) || 100;
                payload.places_occupees = 0;
                if (pointId) payload.position = pointId;
            } else {
                // Feux
                if (pointId) payload.position = pointId;
            }

            // 3. On crée l'objet
            const res = await fetch(
                `http://localhost:8000/api/map/${nouveauObjet.type_api}/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                },
            );

            if (res.ok) {
                setOpenModal(false);
                setNouveauObjet({
                    type_api: 'feux',
                    nom: '',
                    description: '',
                    details: '',
                }); // Reset
                chargerDonnees(); // Rafraîchir la carte
            } else {
                console.error('Erreur lors de la création', await res.json());
                alert(
                    "Erreur lors de la création de l'objet. Vérifiez la console.",
                );
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
            }}
        >
            {/* BOUTON FLOTTANT D'AJOUT (Uniquement pour Admin) */}
            {isAdmin && (
                <Fab
                    color={modeAjout ? 'secondary' : 'primary'}
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 90, md: 30 },
                        right: { xs: 20, md: 30 },
                        zIndex: 1000,
                    }}
                    onClick={() => setModeAjout(!modeAjout)}
                >
                    {modeAjout ? <Close /> : <Add />}
                </Fab>
            )}

            {/* MESSAGE D'INSTRUCTION */}
            {modeAjout && (
                <Alert
                    icon={<LocationOn fontSize="inherit" />}
                    severity="info"
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 160, md: 100 },
                        right: { xs: 20, md: 30 },
                        zIndex: 1000,
                        boxShadow: 3,
                    }}
                >
                    Cliquez n'importe où sur la carte pour placer l'objet.
                </Alert>
            )}

            {/* LA CARTE (On lui passe les props pour le clic) */}
            <Box
                sx={{
                    flex: 1,
                    zIndex: 0,
                    filter: rechercheActive ? 'blur(2px)' : 'none',
                    transition: 'filter 0.3s',
                }}
            >
                <Carte
                    donnees={donneesMap}
                    enModeAjout={modeAjout}
                    auClicCarte={handleClicCarte}
                    doitCentrer={doitCentrer}
                />
            </Box>

            {/* --- LE MODAL DE CRÉATION DE L'OBJET --- */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Créer un équipement connecté
                </DialogTitle>
                <DialogContent
                    sx={{
                        pt: '20px !important',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Type d'équipement</InputLabel>
                        <Select
                            value={nouveauObjet.type_api}
                            label="Type d'équipement"
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    type_api: e.target.value,
                                })
                            }
                        >
                            <MenuItem value="feux">Feu Tricolore</MenuItem>
                            <MenuItem value="vehicules">
                                Bus / Véhicule
                            </MenuItem>
                            <MenuItem value="parkings">Parking</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Nom de l'objet (ex: Feu croisement Nord)"
                        fullWidth
                        value={nouveauObjet.nom}
                        onChange={(e) =>
                            setNouveauObjet({
                                ...nouveauObjet,
                                nom: e.target.value,
                            })
                        }
                    />

                    {nouveauObjet.type_api === 'vehicules' && (
                        <TextField
                            label="Plaque d'immatriculation"
                            fullWidth
                            value={nouveauObjet.details}
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    details: e.target.value,
                                })
                            }
                        />
                    )}

                    {nouveauObjet.type_api === 'parkings' && (
                        <TextField
                            label="Nombre de places totales"
                            type="number"
                            fullWidth
                            value={nouveauObjet.details}
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    details: e.target.value,
                                })
                            }
                        />
                    )}

                    <TextField
                        label="Description (Optionnel)"
                        multiline
                        rows={3}
                        fullWidth
                        value={nouveauObjet.description}
                        onChange={(e) =>
                            setNouveauObjet({
                                ...nouveauObjet,
                                description: e.target.value,
                            })
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenModal(false)} color="inherit">
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreerObjet}
                        disableElevation
                    >
                        Placer sur la carte
                    </Button>
                </DialogActions>
            </Dialog>

            {/* --- LA BARRE DE RECHERCHE (Ton code original intouché) --- */}
            <Paper
                elevation={rechercheActive ? 0 : 3}
                sx={{
                    position: 'absolute',
                    top: rechercheActive ? 0 : 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: rechercheActive ? '100%' : '90%',
                    maxWidth: rechercheActive ? 'none' : 600,
                    borderRadius: rechercheActive ? 0 : 8,
                    bgcolor: 'white',
                    pt: rechercheActive ? 2 : 0,
                    zIndex: 1000,
                    transition: 'all 0.3s ease-in-out',
                    minHeight: rechercheActive ? '100vh' : 'auto',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        mb: rechercheActive ? 2 : 0,
                    }}
                >
                    {rechercheActive && (
                        <IconButton
                            onClick={() => setRechercheActive(false)}
                            sx={{ mr: 1 }}
                        >
                            <Close />
                        </IconButton>
                    )}
                    <TextField
                        fullWidth
                        variant="standard"
                        placeholder="Rechercher un objet, une rue..."
                        inputRef={inputRef}
                        onFocus={() => setRechercheActive(true)}
                        value={recherche}
                        onChange={(e) => setRecherche(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                chargerDonnees(categorieActuelle, recherche);
                                setRechercheActive(false);
                                inputRef.current?.blur();
                            }
                        }}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: !rechercheActive && (
                                <InputAdornment position="start">
                                    <Search color="action" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ py: 1.5 }}
                    />
                </Box>
                {rechercheActive && (
                    <Box sx={{ px: 2 }}>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{ mb: 3, overflowX: 'auto', pb: 1 }}
                        >
                            <Chip
                                icon={<MapIcon />}
                                label="Toute la ville"
                                onClick={() => {
                                    chargerDonnees('global');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'global'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<DirectionsBus />}
                                label="Bus & Vélibs"
                                onClick={() => {
                                    chargerDonnees('vehicules');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'vehicules'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<LocalParking />}
                                label="Parkings"
                                onClick={() => {
                                    chargerDonnees('parkings');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'parkings'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                            <Chip
                                icon={<Traffic />}
                                label="Feux"
                                onClick={() => {
                                    chargerDonnees('feux');
                                    setRechercheActive(false);
                                }}
                                color={
                                    categorieActuelle === 'feux'
                                        ? 'primary'
                                        : 'default'
                                }
                                clickable
                            />
                        </Stack>
                        {chargement && donneesMap.length === 0 && (
                            <Typography
                                sx={{
                                    py: 2,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                Analyse de la ville en cours...
                            </Typography>
                        )}
                        {aucunResultat && (
                            <Paper
                                sx={{
                                    p: 2,
                                    mt: 1,
                                    bgcolor: '#fff5f5',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography color="error" variant="body2">
                                    Aucun objet trouvé pour "
                                    <strong>{termeFixe}</strong>".
                                </Typography>
                            </Paper>
                        )}
                        <Typography
                            variant="overline"
                            sx={{ color: 'text.secondary', fontWeight: 'bold' }}
                        >
                            Recherches récentes
                        </Typography>
                        <List>
                            {historique.map((item, index) => (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => {
                                        setRecherche(item);
                                        chargerDonnees('global', item);
                                        setRechercheActive(false);
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <History fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default PageCarte;

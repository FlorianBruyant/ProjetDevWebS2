import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Chip,
    Tabs,
    Tab,
    Grid,
    TextField,
    Switch,
    FormControlLabel,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Autocomplete,
    createFilterOptions,
} from '@mui/material';
import {
    ArrowBack,
    Lock,
    Build,
    History,
    Save,
    Delete,
    Map as MapIcon,
    Traffic,
    Speed,
    LocalParking,
    EventNote,
    Warning,
    PowerOff,
    People,
} from '@mui/icons-material';

// Filtre pour l'Autocomplete
const filter = createFilterOptions();

export default function GestionObjet() {
    const { type_api, id } = useParams();
    const navigate = useNavigate();
    const [tabActif, setTabActif] = useState(0);

    const [objet, setObjet] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [messageSucces, setMessageSucces] = useState('');

    const [zonesPossibles, setZonesPossibles] = useState([]);

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        est_actif: true,
        en_panne: false,
        zone: '',
    });

    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    useEffect(() => {
        const initialiserPage = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/connexion');
                return;
            }

            try {
                // 1. Vérification du rôle
                const resUser = await fetch(`${API_BASE_URL}/api/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resUser.ok) {
                    const userData = await resUser.json();
                    setIsAdmin(userData.role === 'ADMIN' || userData.role === 'COMPLEXE');
                }

                // 2. Récupération des Zones
                const resZones = await fetch(`${API_BASE_URL}/api/map/zones/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resZones.ok) {
                    const zonesData = await resZones.json();
                    setZonesPossibles(zonesData);
                }

                // 3. Récupération de l'objet
                const resObj = await fetch(`${API_BASE_URL}/api/map/${type_api}/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!resObj.ok) {
                    throw new Error("L'objet est introuvable dans la base de données.");
                }

                const dataObj = await resObj.json();
                setObjet(dataObj);

                setFormData({
                    nom: dataObj.nom || '',
                    description: dataObj.description || '',
                    est_actif: Boolean(dataObj.est_actif),
                    en_panne: Boolean(dataObj.en_panne),
                    zone: dataObj.zone || '',
                });
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };
        initialiserPage();
    }, [type_api, id, navigate]);

    useEffect(() => {
        const crediterPoints = async () => {
            const token = localStorage.getItem('access_token');
            if (!token || !id || !objet) return;

            try {
                const res = await fetch(`${API_BASE_URL}/api/map/consulter/${id}/`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (res.ok) console.log(' Points de citoyenneté ajoutés !');
            } catch (err) {
                console.error('Erreur réseau points:', err);
            }
        };
        crediterPoints();
    }, [id, objet]);

    const handleSave = async () => {
        if (!isAdmin) return;
        setMessageSucces('');
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`${API_BASE_URL}/api/map/${type_api}/${id}/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                const updatedData = await res.json();
                setObjet(updatedData);
                setMessageSucces('Modifications enregistrées avec succès !');
            } else {
                throw new Error('Erreur lors de la mise à jour.');
            }
        } catch (err) {
            setErreur(err.message);
        }
    };

    if (chargement)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    // --- CALCULS POUR L'EN-TÊTE DES STATS ---
    const logs = objet?.historique || [];
    const nbPannes = logs.filter(log => log.est_en_panne).length;
    // On considère "éteint" si la consommation est à 0 et que ce n'est pas une panne.
    const nbEteint = logs.filter(
        log => log.consommation_kwh === 0 && !log.est_en_panne && objet?.type_api !== 'lieux' && objet?.type_api !== 'evenements'
    ).length;

    // Calcul du remplissage pour les parkings
    const tauxRemplissage =
        objet?.type_api === 'parkings' && objet?.places_totales > 0
            ? Math.round((objet.places_occupees / objet.places_totales) * 100)
            : 0;

    return (
        <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', py: 4, mt: 8 }}>
            <Container maxWidth="md">
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/carte')} sx={{ mb: 2, textTransform: 'none' }}>
                    Retour à la gestion urbaine
                </Button>

                <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 3,
                        }}>
                        <Box>
                            <Typography variant="h4" fontWeight="900" color="primary">
                                {objet?.nom}
                                {!isAdmin && (
                                    <Lock
                                        sx={{
                                            ml: 2,
                                            color: 'text.secondary',
                                            fontSize: 20,
                                        }}
                                    />
                                )}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Catégorie : {type_api.toUpperCase()} | ID Système : #{id}
                            </Typography>
                        </Box>
                        <Chip
                            label={formData.en_panne ? 'MAINTENANCE' : 'ACTIF'}
                            color={formData.en_panne ? 'error' : 'success'}
                            sx={{ fontWeight: 'bold', height: 32 }}
                        />
                    </Box>

                    <Tabs
                        value={tabActif}
                        onChange={(e, v) => setTabActif(v)}
                        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}>
                        <Tab icon={<Build fontSize="small" />} iconPosition="start" label="Configuration" />
                        <Tab icon={<History fontSize="small" />} iconPosition="start" label="Statistiques & Logs" />
                    </Tabs>

                    {messageSucces && (
                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
                            {messageSucces}
                        </Alert>
                    )}
                    {erreur && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {erreur}
                        </Alert>
                    )}

                    {/* ONGLET 0 : CONFIGURATION */}
                    {tabActif === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom de l'équipement"
                                    value={formData.nom}
                                    disabled={!isAdmin}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            nom: e.target.value,
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Description"
                                    multiline
                                    rows={1}
                                    value={formData.description}
                                    disabled={!isAdmin}
                                    onChange={e =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            {/* SÉLECTEUR DE ZONE */}
                            <Grid item xs={12}>
                                <Autocomplete
                                    fullWidth
                                    disabled={!isAdmin}
                                    value={zonesPossibles.find(z => z.id === formData.zone) || formData.zone || null}
                                    onChange={(event, newValue) => {
                                        if (typeof newValue === 'string') {
                                            setFormData({
                                                ...formData,
                                                zone: newValue,
                                            });
                                        } else if (newValue && newValue.inputValue) {
                                            setFormData({
                                                ...formData,
                                                zone: newValue.inputValue,
                                            });
                                        } else {
                                            setFormData({
                                                ...formData,
                                                zone: newValue?.id || '',
                                            });
                                        }
                                    }}
                                    filterOptions={(options, params) => {
                                        const filtered = filter(options, params);
                                        const { inputValue } = params;
                                        const isExisting = options.some(option => inputValue === option.nom);
                                        if (inputValue !== '' && !isExisting) {
                                            filtered.push({
                                                inputValue,
                                                nom: `Ajouter la nouvelle zone : "${inputValue}"`,
                                            });
                                        }
                                        return filtered;
                                    }}
                                    options={zonesPossibles}
                                    getOptionLabel={option => {
                                        if (typeof option === 'string') return option;
                                        if (option.inputValue) return option.inputValue;
                                        return option.nom || '';
                                    }}
                                    freeSolo
                                    renderInput={params => {
                                        const { InputProps, ...restParams } = params;
                                        return (
                                            <TextField
                                                {...restParams}
                                                label="Affecter à une Zone urbaine"
                                                helperText="Choisissez une zone existante ou tapez-en une nouvelle pour la créer."
                                                InputProps={{
                                                    ...InputProps,
                                                    startAdornment: (
                                                        <>
                                                            <MapIcon
                                                                sx={{
                                                                    color: 'action.active',
                                                                    mr: 1,
                                                                    ml: 1,
                                                                }}
                                                            />
                                                            {InputProps?.startAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        );
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                                    <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                        Informations en temps réel
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {(type_api === 'lieux' || type_api === 'evenements') && (
                                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <People sx={{ mr: 1, color: 'info.main' }} />
                                                <Typography>
                                                    Fréquentation : <strong>{objet?.frequentation || 0} visiteurs</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {type_api === 'feux' && (
                                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Traffic
                                                    sx={{
                                                        mr: 1,
                                                        color: objet?.etat_actuel === 'VERT' ? 'success.main' : 'error.main',
                                                    }}
                                                />
                                                <Typography>
                                                    Couleur : <strong>{objet?.etat_actuel}</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {type_api === 'vehicules' && (
                                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Speed sx={{ mr: 1, color: 'primary.main' }} />
                                                <Typography>
                                                    Vitesse : <strong>{objet?.vitesse} km/h</strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {type_api === 'parkings' && (
                                            <Grid item xs={6} sx={{ display: 'flex', alignItems: 'center' }}>
                                                <LocalParking sx={{ mr: 1, color: 'secondary.main' }} />
                                                <Typography>
                                                    Occupation :{' '}
                                                    <strong>
                                                        {objet?.places_occupees} / {objet?.places_totales}
                                                    </strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.est_actif}
                                            disabled={!isAdmin}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    est_actif: e.target.checked,
                                                })
                                            }
                                        />
                                    }
                                    label="Équipement sous tension"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.en_panne}
                                            disabled={!isAdmin}
                                            onChange={e =>
                                                setFormData({
                                                    ...formData,
                                                    en_panne: e.target.checked,
                                                })
                                            }
                                            color="error"
                                        />
                                    }
                                    label="Signaler une panne"
                                />
                            </Grid>

                            {isAdmin && (
                                <Grid
                                    item
                                    xs={12}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        mt: 3,
                                    }}>
                                    <Button
                                        color="error"
                                        variant="text"
                                        startIcon={<Delete />}
                                        onClick={() => setOpenDeleteModal(true)}>
                                        Supprimer l'unité
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Save />}
                                        onClick={handleSave}
                                        sx={{ borderRadius: 2, px: 4 }}>
                                        Appliquer les changements
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {/* ONGLET 1 : HISTORIQUE ET LOGS */}
                    {tabActif === 1 && (
                        <Box>
                            {/* --- NOUVEL EN-TÊTE : DASHBOARD DE L'OBJET --- */}
                            <Grid container spacing={2} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={4}>
                                    <Paper
                                        sx={{
                                            p: 2,
                                            textAlign: 'center',
                                            bgcolor: '#ffebee',
                                            borderRadius: 3,
                                            border: '1px solid #ffcdd2',
                                        }}>
                                        <Warning color="error" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" color="error" fontWeight="bold">
                                            {nbPannes}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pannes Historiques
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {objet?.type_api !== 'lieux' && objet?.type_api !== 'evenements' && (
                                    <Grid item xs={12} sm={4}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                bgcolor: '#eceff1',
                                                borderRadius: 3,
                                                border: '1px solid #cfd8dc',
                                            }}>
                                            <PowerOff
                                                sx={{
                                                    fontSize: 32,
                                                    mb: 1,
                                                    color: '#78909c',
                                                }}
                                            />
                                            <Typography variant="h5" color="text.secondary" fontWeight="bold">
                                                {nbEteint}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Mises hors tension
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}

                                {objet?.type_api === 'parkings' && (
                                    <Grid item xs={12} sm={4}>
                                        <Paper
                                            sx={{
                                                p: 2,
                                                textAlign: 'center',
                                                bgcolor: '#e3f2fd',
                                                borderRadius: 3,
                                                border: '1px solid #bbdefb',
                                            }}>
                                            <LocalParking color="primary" sx={{ fontSize: 32, mb: 1 }} />
                                            <Typography variant="h5" color="primary" fontWeight="bold">
                                                {tauxRemplissage}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Taux de remplissage
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                )}
                            </Grid>
                            {/* --- FIN EN-TÊTE --- */}

                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventNote sx={{ mr: 1 }} /> Dernières activités
                            </Typography>

                            <List>
                                {logs.length > 0 ? (
                                    logs.map((log, index) => (
                                        <ListItem key={index} divider={index !== logs.length - 1}>
                                            <ListItemText
                                                primary={(() => {
                                                    if (objet.type_api === 'lieux' || objet.type_api === 'evenements') {
                                                        return `Affluence : ${log.frequentation || 0} personnes`;
                                                    }
                                                    if (objet.type_api === 'parkings') {
                                                        return `Fréquentation : ${log.frequentation || 0} véhicules | Conso: ${log.consommation_kwh} kWh`;
                                                    }
                                                    return log.est_en_panne
                                                        ? 'Panne signalée'
                                                        : `Consommation : ${log.consommation_kwh} kWh`;
                                                })()}
                                                secondary={(() => {
                                                    const dateBrute = log.date_mesure || log.date || log.date_action;
                                                    if (!dateBrute) return 'Date inconnue';
                                                    const d = new Date(dateBrute);
                                                    return isNaN(d.getTime())
                                                        ? 'Format date invalide'
                                                        : d.toLocaleString('fr-FR');
                                                })()}
                                            />
                                            {log.points_gagnes > 0 && (
                                                <Chip
                                                    label={`+${log.points_gagnes} pts`}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                            )}
                                        </ListItem>
                                    ))
                                ) : (
                                    <Typography sx={{ py: 4, textAlign: 'center' }} color="text.secondary">
                                        Aucun historique disponible pour cet équipement.
                                    </Typography>
                                )}
                            </List>
                        </Box>
                    )}
                </Paper>
            </Container>

            <Dialog open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}>
                <DialogTitle>Confirmer la mise hors service ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Cette action supprimera définitivement l'objet <strong>{objet?.nom}</strong> de la base de données
                        urbaine.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDeleteModal(false)}>Annuler</Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={async () => {
                            const token = localStorage.getItem('access_token');
                            await fetch(`${API_BASE_URL}/api/map/${type_api}/${id}/`, {
                                method: 'DELETE',
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            });
                            navigate('/carte');
                        }}>
                        Confirmer la suppression
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Paper,
    Tabs,
    Tab,
    Button,
    Chip,
    Divider,
    TextField,
    Grid,
    Switch,
    FormControlLabel,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Tooltip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
} from '@mui/material';
import {
    ArrowBack,
    Save,
    Delete,
    Lock,
    Build,
    History,
    Speed,
    Traffic,
    LocalParking,
    EventNote,
} from '@mui/icons-material';

export default function GestionObjet() {
    const { type_api, id } = useParams();
    const navigate = useNavigate();
    const [tabActif, setTabActif] = useState(0);

    const [objet, setObjet] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [messageSucces, setMessageSucces] = useState('');

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        est_actif: true,
        en_panne: false,
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
                const resUser = await fetch('http://localhost:8000/api/me/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resUser.ok) {
                    const userData = await resUser.json();
                    setIsAdmin(userData.role === 'ADMIN');
                }

                const resObj = await fetch(
                    `http://localhost:8000/api/map/${type_api}/${id}/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                if (!resObj.ok)
                    throw new Error(
                        "L'objet est introuvable dans la base de données.",
                    );

                const dataObj = await resObj.json();
                setObjet(dataObj);
                setFormData({
                    nom: dataObj.nom || '',
                    description: dataObj.description || '',
                    est_actif: dataObj.est_actif ?? true,
                    en_panne: dataObj.en_panne ?? false,
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
                const res = await fetch(
                    `http://localhost:8000/api/map/consulter/${id}/`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    },
                );

                if (res.ok) {
                    console.log(
                        '💎 Points de citoyenneté réellement ajoutés en BDD !',
                    );
                    // Optionnel : tu peux déclencher une alerte ici pour confirmer à l'utilisateur
                } else {
                    console.error(
                        'Erreur serveur lors du crédit des points:',
                        res.status,
                    );
                }
            } catch (err) {
                console.error('Erreur réseau points:', err);
            }
        };

        crediterPoints();
    }, [id, objet]); // S'exécute dès que l'objet est chargé

    const handleSave = async () => {
        if (!isAdmin) return;
        setMessageSucces('');
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(
                `http://localhost:8000/api/map/${type_api}/${id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                },
            );

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

    return (
        <Box sx={{ bgcolor: '#F4F6F8', minHeight: '100vh', py: 4, mt: 8 }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/carte')}
                    sx={{ mb: 2, textTransform: 'none' }}
                >
                    Retour à la gestion urbaine
                </Button>

                <Paper elevation={4} sx={{ p: 4, borderRadius: 4 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 3,
                        }}
                    >
                        <Box>
                            <Typography
                                variant="h4"
                                fontWeight="900"
                                color="primary"
                            >
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
                                Catégorie : {type_api.toUpperCase()} | ID
                                Système : #{id}
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
                        sx={{ mb: 4, borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab
                            icon={<Build fontSize="small" />}
                            iconPosition="start"
                            label="Configuration"
                        />
                        <Tab
                            icon={<History fontSize="small" />}
                            iconPosition="start"
                            label="Statistiques & Logs"
                        />
                    </Tabs>

                    {messageSucces && (
                        <Alert
                            severity="success"
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
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
                                    onChange={(e) =>
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
                                    value={formData.description}
                                    disabled={!isAdmin}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            description: e.target.value,
                                        })
                                    }
                                />
                            </Grid>

                            {/* Données spécifiques selon le type */}
                            <Grid item xs={12}>
                                <Paper
                                    variant="outlined"
                                    sx={{ p: 2, bgcolor: '#f8f9fa' }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        gutterBottom
                                        color="text.secondary"
                                    >
                                        Informations en temps réel
                                    </Typography>
                                    <Grid container spacing={2}>
                                        {type_api === 'feux' && (
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Traffic
                                                    sx={{
                                                        mr: 1,
                                                        color:
                                                            objet?.etat_actuel ===
                                                            'VERT'
                                                                ? 'success.main'
                                                                : 'error.main',
                                                    }}
                                                />
                                                <Typography>
                                                    Couleur :{' '}
                                                    <strong>
                                                        {objet?.etat_actuel}
                                                    </strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {type_api === 'vehicules' && (
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Speed
                                                    sx={{
                                                        mr: 1,
                                                        color: 'primary.main',
                                                    }}
                                                />
                                                <Typography>
                                                    Vitesse :{' '}
                                                    <strong>
                                                        {objet?.vitesse} km/h
                                                    </strong>
                                                </Typography>
                                            </Grid>
                                        )}
                                        {type_api === 'parkings' && (
                                            <Grid
                                                item
                                                xs={6}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <LocalParking
                                                    sx={{
                                                        mr: 1,
                                                        color: 'secondary.main',
                                                    }}
                                                />
                                                <Typography>
                                                    Occupation :{' '}
                                                    <strong>
                                                        {objet?.places_occupees}{' '}
                                                        /{' '}
                                                        {objet?.places_totales}
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
                                            onChange={(e) =>
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
                                            onChange={(e) =>
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
                                    }}
                                >
                                    <Button
                                        color="error"
                                        variant="text"
                                        startIcon={<Delete />}
                                        onClick={() => setOpenDeleteModal(true)}
                                    >
                                        Supprimer l'unité
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        startIcon={<Save />}
                                        onClick={handleSave}
                                        sx={{ borderRadius: 2, px: 4 }}
                                    >
                                        Appliquer les changements
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {/* ONGLET 1 : HISTORIQUE ET LOGS */}
                    {tabActif === 1 && (
                        <Box>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ display: 'flex', alignItems: 'center' }}
                            >
                                <EventNote sx={{ mr: 1 }} /> Dernières activités
                            </Typography>
                            <List>
                                {objet?.historique &&
                                objet.historique.length > 0 ? (
                                    objet.historique.map((log, index) => (
                                        <ListItem
                                            key={index}
                                            divider={
                                                index !==
                                                objet.historique.length - 1
                                            }
                                        >
                                            <ListItemText
                                                primary={log.action}
                                                secondary={new Date(
                                                    log.date_action,
                                                ).toLocaleString('fr-FR')}
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
                                    <Typography
                                        sx={{ py: 4, textAlign: 'center' }}
                                        color="text.secondary"
                                    >
                                        Aucun historique disponible pour cet
                                        équipement.
                                    </Typography>
                                )}
                            </List>
                        </Box>
                    )}
                </Paper>
            </Container>

            {/* Modal de suppression */}
            <Dialog
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
            >
                <DialogTitle>Confirmer la mise hors service ?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Cette action supprimera définitivement l'objet{' '}
                        <strong>{objet?.nom}</strong> de la base de données
                        urbaine.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={async () => {
                            const token = localStorage.getItem('access_token');
                            await fetch(
                                `http://localhost:8000/api/map/${type_api}/${id}/`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                },
                            );
                            navigate('/carte');
                        }}
                    >
                        Confirmer la suppression
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

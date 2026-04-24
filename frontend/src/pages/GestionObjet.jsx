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
} from '@mui/material';
import { ArrowBack, Save, Delete, Lock, Build } from '@mui/icons-material';

export default function GestionObjet() {
    const { type_api, id } = useParams();
    const navigate = useNavigate();
    const [tabActif, setTabActif] = useState(0);

    // --- États des données ---
    const [objet, setObjet] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');
    const [messageSucces, setMessageSucces] = useState('');
    const [formData, setFormData] = useState({ nom: '', description: '' });
    const [openDeleteModal, setOpenDeleteModal] = useState(false);

    useEffect(() => {
        const initialiserPage = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/connexion');
                return;
            }

            try {
                // 1. Vérification du rôle utilisateur (Sécurité)
                const resUser = await fetch('http://localhost:8000/api/me/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (resUser.ok) {
                    const userData = await resUser.json();
                    setIsAdmin(userData.role === 'ADMIN');
                }

                // 2. Récupération de l'objet (URL dynamique selon le type)
                const resObj = await fetch(
                    `http://localhost:8000/api/map/${type_api}/${id}/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );

                if (!resObj.ok)
                    throw new Error("L'objet est introuvable sur le serveur.");

                const dataObj = await resObj.json();
                setObjet(dataObj);
                setFormData({
                    nom: dataObj.nom || '',
                    description: dataObj.description || '',
                });
            } catch (err) {
                setErreur(err.message);
            } finally {
                setChargement(false);
            }
        };
        initialiserPage();
    }, [type_api, id, navigate]);

    // --- Sauvegarde réelle (PATCH) ---
    const handleSave = async () => {
        if (!isAdmin) return;
        setMessageSucces('');
        setErreur('');
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
                setMessageSucces(
                    'Modifications enregistrées en base de données !',
                );
            } else {
                throw new Error(
                    'Action refusée : droits administrateur requis.',
                );
            }
        } catch (err) {
            setErreur(err.message);
        }
    };

    // --- Suppression réelle (DELETE) ---
    const handleDelete = async () => {
        if (!isAdmin) return;
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(
                `http://localhost:8000/api/map/${type_api}/${id}/`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                },
            );

            if (res.ok) {
                navigate('/carte'); // Redirection après suppression
            } else {
                throw new Error('Impossible de supprimer cet objet.');
            }
        } catch (err) {
            setErreur(err.message);
            setOpenDeleteModal(false);
        }
    };

    if (chargement)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', py: 4, mt: 8 }}>
            <Container maxWidth="md">
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/carte')}
                    sx={{ mb: 2, textTransform: 'none', fontWeight: 'bold' }}
                >
                    Retour à la carte
                </Button>

                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    {/* Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3,
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            sx={{ display: 'flex', alignItems: 'center' }}
                        >
                            {objet?.nom}
                            {!isAdmin && (
                                <Tooltip title="Lecture seule">
                                    <Lock
                                        sx={{
                                            ml: 2,
                                            color: 'text.secondary',
                                            fontSize: 24,
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Typography>
                        <Chip
                            label={objet?.en_panne ? 'Maintenance' : 'En Ligne'}
                            color={objet?.en_panne ? 'warning' : 'success'}
                            icon={objet?.en_panne ? <Build /> : null}
                        />
                    </Box>

                    <Tabs
                        value={tabActif}
                        onChange={(e, v) => setTabActif(v)}
                        variant="fullWidth"
                        sx={{ mb: 4 }}
                    >
                        <Tab label="Configuration" />
                        <Tab label="Surveillance" />
                    </Tabs>

                    {!isAdmin && (
                        <Alert severity="info" sx={{ mb: 3 }}>
                            Vous consultez cet objet en mode{' '}
                            <strong>Lecture Seule</strong>. Les modifications
                            sont réservées aux administrateurs.
                        </Alert>
                    )}

                    {messageSucces && (
                        <Alert
                            severity="success"
                            sx={{ mb: 3 }}
                            onClose={() => setMessageSucces('')}
                        >
                            {messageSucces}
                        </Alert>
                    )}
                    {erreur && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={() => setErreur('')}
                        >
                            {erreur}
                        </Alert>
                    )}

                    {/* Onglet 1 : Gestion CRUD */}
                    {tabActif === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom de l'objet"
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
                                        variant="outlined"
                                        startIcon={<Delete />}
                                        onClick={() => setOpenDeleteModal(true)}
                                    >
                                        Supprimer
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                        onClick={handleSave}
                                        sx={{ px: 4 }}
                                    >
                                        Enregistrer
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    )}

                    {/* Onglet 2 : Stats simulées */}
                    {tabActif === 1 && (
                        <Box sx={{ textAlign: 'center', py: 5 }}>
                            <Typography color="text.secondary">
                                Les statistiques de consommation et
                                d'utilisation s'afficheront ici prochainement.
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>

            <Dialog
                open={openDeleteModal}
                onClose={() => setOpenDeleteModal(false)}
            >
                <DialogTitle sx={{ color: 'error.main' }}>
                    Confirmer la suppression
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Êtes-vous sûr de vouloir supprimer définitivement{' '}
                        <strong>{objet?.nom}</strong> ?
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenDeleteModal(false)}>
                        Annuler
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                    >
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

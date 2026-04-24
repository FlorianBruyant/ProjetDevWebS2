import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Button,
    Container,
    CircularProgress,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Profil() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chargement, setChargement] = useState(true);

    // Etats pour la modification
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const fetchProfil = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/connexion');
                return;
            }
            try {
                const response = await fetch('http://localhost:8000/api/me/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setEditData(data);
                } else {
                    localStorage.clear();
                    navigate('/connexion');
                }
            } catch (error) {
                console.error('Erreur backend :', error);
            } finally {
                setChargement(false);
            }
        };
        fetchProfil();
    }, [navigate]);

    const handleUpdate = async () => {
        setIsUpdating(true);
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch('http://localhost:8000/api/me/', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    genre: editData.genre,
                    type_membre: editData.type_membre,
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setOpen(false);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/connexion');
    };

    const calculerProgression = (pts) => {
        const safePts = pts || 0;
        if (safePts < 3) return (safePts / 3) * 100;
        if (safePts < 5) return ((safePts - 3) / 2) * 100;
        if (safePts < 7) return ((safePts - 5) / 2) * 100;
        return 100;
    };

    if (chargement)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pb: 10 }}>
            {/* Bannière */}
            <Box
                sx={{
                    height: '120px',
                    background:
                        'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                }}
            />

            <Container maxWidth="sm" sx={{ mt: -6 }}>
                {/* En-tête Profil */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                            bgcolor: '#3f51b5',
                            fontSize: '2.5rem',
                            mb: 2,
                        }}
                    >
                        {user?.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                        {user?.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {user?.email}
                    </Typography>
                </Box>

                {/* --- MODULE NIVEAU / XP --- */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="primary"
                        >
                            Niveau {user?.niveau || 'Débutant'}
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                            {user?.points || 0} / 7.00 XP
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculerProgression(user?.points)}
                        sx={{ height: 10, borderRadius: 5, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                        Gagnez de l'XP en consultant des objets sur la carte !
                    </Typography>
                </Paper>
                {/* --- BOUTON MODIF PROFIL --- */}
                <Button size="small" onClick={() => setOpen(true)}>
                    Modifier
                </Button>
                {/* --- INFORMATIONS PUBLIQUES --- */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Informations publiques
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Rôle :</strong> {user?.role || 'Utilisateur'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Genre :</strong>{' '}
                        {user?.genre || 'Non renseigné'}
                    </Typography>
                    <Typography>
                        <strong>Type de membre :</strong>{' '}
                        {user?.type_membre || 'Citoyen'}
                    </Typography>
                </Paper>

                {/* --- DIALOG DE MODIFICATION --- */}
                <Dialog
                    open={open}
                    onClose={() => setOpen(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Modifier mon profil</DialogTitle>
                    <DialogContent
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            pt: 1,
                        }}
                    >
                        <TextField
                            select
                            fullWidth
                            label="Genre"
                            value={editData.genre || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    genre: e.target.value,
                                })
                            }
                        >
                            {/* Correction : On utilise les clés du modèle Django ('M', 'F', etc.) */}
                            <MenuItem value="M">Masculin</MenuItem>
                            <MenuItem value="F">Féminin</MenuItem>
                            <MenuItem value="A">Autre</MenuItem>
                            <MenuItem value="NR">Non renseigné</MenuItem>
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Type de membre"
                            value={editData.type_membre || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    type_membre: e.target.value,
                                })
                            }
                        >
                            <MenuItem value="Citoyen">Citoyen</MenuItem>
                            <MenuItem value="Étudiant">Étudiant</MenuItem>
                            <MenuItem value="Professionnel">
                                Professionnel
                            </MenuItem>
                        </TextField>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpen(false)} color="inherit">
                            Annuler
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            variant="contained"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* --- STATISTIQUES --- */}
                <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Statistiques
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Connexions totales :</strong>{' '}
                        {user?.nb_acces || 0}
                    </Typography>
                    <Typography>
                        <strong>Dernière action :</strong>{' '}
                        {user?.date_derniere_action
                            ? new Date(
                                  user.date_derniere_action,
                              ).toLocaleString()
                            : '--'}
                    </Typography>
                </Paper>

                <Button
                    fullWidth
                    variant="contained"
                    color="error"
                    onClick={handleLogout}
                    sx={{ py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                    Se déconnecter
                </Button>
            </Container>
        </Box>
    );
}

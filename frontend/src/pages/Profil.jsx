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
    Divider,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    MenuItem,
    IconButton,
    Stack,
    Chip, // <-- C'était lui l'oublié !
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    PhotoCamera,
    BadgeRounded,
    AdminPanelSettingsRounded,
    LogoutRounded,
    EmailRounded,
    SettingsSuggestRounded,
    MilitaryTechRounded,
    VerifiedUserRounded,
    CalendarMonthRounded,
} from '@mui/icons-material';

export default function Profil() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chargement, setChargement] = useState(true);

    // Etats pour la modification
    const [open, setOpen] = useState(false);
    const [editData, setEditData] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');

    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const API_BASE = 'http://localhost:8000';

    // Fonction pour modif photo de profil
    const handlePhotoChange = async event => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_BASE}/api/me/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
            } else {
                alert("Erreur lors de l'upload de l'image");
            }
        } catch (error) {
            console.error('Erreur upload:', error);
        }
    };

    const aModifieDonneesSensibles = () => {
        const normalize = v => v ?? '';
        return (
            normalize(editData.username) !== normalize(user?.username) ||
            normalize(editData.email) !== normalize(user?.email) ||
            showPasswordFields
        );
    };

    useEffect(() => {
        const fetchProfil = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/connexion');
                return;
            }
            try {
                const response = await fetch(`${API_BASE}/api/me/`, {
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
        setErrorMsg('');
        const token = localStorage.getItem('access_token');

        const payload = {
            genre: editData.genre,
            type_membre: editData.type_membre,
            first_name: editData.first_name,
            last_name: editData.last_name,
        };

        let isEmailChanged = false;
        let isPasswordChanged = false;
        let isUsernameChanged = false;

        if (aModifieDonneesSensibles()) {
            if (!currentPassword) {
                setErrorMsg('Veuillez saisir votre mot de passe actuel pour modifier vos identifiants.');
                setIsUpdating(false);
                return;
            }
            payload.current_password = currentPassword;

            if (editData.email !== user.email) {
                payload.email = editData.email;
                isEmailChanged = true;
            }
            if (editData.username !== user.username) {
                payload.username = editData.username;
                isUsernameChanged = true;
            }
            if (showPasswordFields && editData.password) {
                // Regex : Min 8 caractères, 1 Majuscule, 1 Minuscule, 1 Chiffre
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

                if (!passwordRegex.test(editData.password)) {
                    setErrorMsg(
                        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.'
                    );
                    setIsUpdating(false);
                    return;
                }

                if (editData.password !== editData.confirmPassword) {
                    setErrorMsg('Les nouveaux mots de passe ne correspondent pas.');
                    setIsUpdating(false);
                    return;
                }
                payload.password = editData.password;
                isPasswordChanged = true;
            }
        }

        try {
            const response = await fetch(`${API_BASE}/api/me/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                if (isEmailChanged || isPasswordChanged || isUsernameChanged) {
                    alert('Identifiants modifiés. Veuillez vous reconnecter.');
                    handleLogout();
                } else {
                    setUser(data);
                    setOpen(false);
                    setShowPasswordFields(false);
                    setCurrentPassword('');
                }
            } else {
                if (data.current_password) setErrorMsg('Mot de passe actuel incorrect.');
                else setErrorMsg(data.detail || 'Erreur lors de la mise à jour.');
            }
        } catch {
            setErrorMsg('Erreur de connexion.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/connexion');
    };

    const progressionVisuelle = pts => Math.min((pts / 50) * 100, 100);

    if (chargement)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
                <CircularProgress sx={{ color: '#0f766e' }} />
            </Box>
        );

    return (
        <Box sx={{ background: 'linear-gradient(180deg, #f3f8f6 0%, #eef3f8 100%)', minHeight: '100vh', pb: 10 }}>
            {/* Bannière Smart City */}
            <Box
                sx={{ height: '220px', background: 'linear-gradient(135deg, #16324f 0%, #0f766e 100%)', position: 'relative' }}
            />

            <Container maxWidth="sm" sx={{ mt: -12 }}>
                {/* En-tête Profil */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={
                                user?.photo_url
                                    ? user.photo_url.startsWith('http')
                                        ? user.photo_url
                                        : `${API_BASE}${user.photo_url}`
                                    : ''
                            }
                            sx={{
                                width: 160,
                                height: 160,
                                border: '8px solid #fff',
                                bgcolor: '#16324f',
                                fontSize: '4rem',
                                fontWeight: 900,
                                boxShadow: '0 20px 40px rgba(22, 50, 79, 0.2)',
                                mb: 2,
                            }}>
                            {!user?.photo_url && user?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <IconButton
                            color="primary"
                            component="label"
                            sx={{
                                position: 'absolute',
                                bottom: 25,
                                right: 10,
                                bgcolor: '#fff',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                '&:hover': { bgcolor: '#f5f5f5' },
                                p: 1.5,
                            }}>
                            <input hidden accept="image/*" type="file" onChange={handlePhotoChange} />
                            <PhotoCamera sx={{ color: '#16324f' }} />
                        </IconButton>
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, color: '#16324f', letterSpacing: '-1px' }}>
                        {user?.username}
                    </Typography>
                    <Chip
                        label={user?.type_membre || 'Citoyen'}
                        variant="outlined"
                        sx={{ mt: 1, borderColor: '#0f766e', color: '#0f766e', fontWeight: 800, px: 2 }}
                    />
                </Box>

                {/* --- MODULE XP REEL --- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: '28px',
                        border: '1px solid rgba(22, 50, 79, 0.08)',
                        boxShadow: '0 15px 35px rgba(22, 50, 79, 0.05)',
                        bgcolor: '#fff',
                    }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="overline" sx={{ color: '#0f766e', fontWeight: 800 }}>
                                Statut Actuel
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: '#16324f' }}>
                                Niveau {user?.niveau || '1'}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right', ml: 10 }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b' }}>
                                POINTS TOTAL
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#0f766e', lineHeight: 1 }}>
                                {user?.points || 0}
                            </Typography>
                        </Box>
                    </Stack>
                    <LinearProgress
                        variant="determinate"
                        value={progressionVisuelle(user?.points)}
                        sx={{
                            height: 14,
                            borderRadius: 7,
                            bgcolor: '#f1f5f9',
                            '& .MuiLinearProgress-bar': { borderRadius: 7, bgcolor: '#0f766e' },
                        }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, color: '#64748b' }}>
                        <MilitaryTechRounded sx={{ fontSize: 20 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Plus vous interagissez avec la ville, plus vous gagnez de points.
                        </Typography>
                    </Stack>
                </Paper>

                {/* --- INFOS PUBLIQUES --- */}
                <Paper
                    elevation={0}
                    sx={{ p: 3, mb: 3, borderRadius: '28px', border: '1px solid rgba(22, 50, 79, 0.08)', bgcolor: '#fff' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                        <BadgeRounded sx={{ color: '#0f766e' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f' }}>
                            Identité Publique
                        </Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<SettingsSuggestRounded />}
                            onClick={() => {
                                setEditData({ ...user });
                                setShowPasswordFields(false);
                                setOpen(true);
                            }}
                            sx={{
                                bgcolor: '#16324f',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontWeight: 700,
                                '&:hover': { bgcolor: '#0f243a' },
                            }}>
                            Gérer
                        </Button>
                    </Stack>

                    <Stack spacing={2}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: '#f8fafc',
                                borderRadius: '16px',
                            }}>
                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Genre</Typography>
                            <Typography sx={{ color: '#16324f', fontWeight: 800 }}>
                                {user?.genre === 'M' ? 'Masculin' : user?.genre === 'F' ? 'Féminin' : 'Autre'}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                p: 2,
                                bgcolor: '#f8fafc',
                                borderRadius: '16px',
                            }}>
                            <Typography sx={{ color: '#64748b', fontWeight: 600 }}>Rôle Système</Typography>
                            <Typography sx={{ color: '#0f766e', fontWeight: 800 }}>
                                {user?.role?.toUpperCase() || 'CITOYEN'}
                            </Typography>
                        </Box>
                    </Stack>
                </Paper>

                {/* --- INFOS PRIVÉES --- */}
                <Paper
                    elevation={0}
                    sx={{ p: 3, mb: 4, borderRadius: '28px', border: '1px solid rgba(22, 50, 79, 0.08)', bgcolor: '#fff' }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                        <AdminPanelSettingsRounded sx={{ color: '#16324f' }} />
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f' }}>
                            Compte & Sécurité
                        </Typography>
                    </Stack>

                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ bgcolor: '#eef2ff', color: '#16324f' }}>
                                <EmailRounded />
                            </Avatar>
                            <Box>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
                                    EMAIL ENREGISTRÉ
                                </Typography>
                                <Typography sx={{ color: '#16324f', fontWeight: 700 }}>{user?.email}</Typography>
                            </Box>
                        </Stack>

                        <Divider sx={{ borderStyle: 'dashed' }} />

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <VerifiedUserRounded sx={{ fontSize: 14 }} /> NOM COMPLET
                                </Typography>
                                <Typography sx={{ color: '#16324f', fontWeight: 700 }}>
                                    {user?.first_name} {user?.last_name}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography
                                    variant="caption"
                                    sx={{ color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarMonthRounded sx={{ fontSize: 14 }} /> DERNIÈRE ACTIVITÉ
                                </Typography>
                                <Typography sx={{ color: '#16324f', fontWeight: 700 }}>
                                    {user?.date_derniere_action
                                        ? new Date(user.date_derniere_action).toLocaleDateString()
                                        : "Aujourd'hui"}
                                </Typography>
                            </Box>
                        </Box>
                    </Stack>
                </Paper>

                <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    startIcon={<LogoutRounded />}
                    onClick={handleLogout}
                    sx={{
                        py: 2,
                        borderRadius: '20px',
                        fontWeight: 900,
                        borderWidth: '2px',
                        transition: 'all 0.3s',
                        '&:hover': { borderWidth: '2px', bgcolor: '#fee2e2', transform: 'translateY(-2px)' },
                    }}>
                    DÉCONNEXION DU RÉSEAU
                </Button>
            </Container>

            {/* Dialog de Modification */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{ sx: { borderRadius: '28px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, color: '#16324f', fontSize: '1.5rem' }}>Mise à jour du profil</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
                    {errorMsg && (
                        <Alert severity="error" sx={{ borderRadius: '14px' }}>
                            {errorMsg}
                        </Alert>
                    )}

                    <TextField
                        select
                        fullWidth
                        label="Genre"
                        value={editData.genre || ''}
                        onChange={e => setEditData({ ...editData, genre: e.target.value })}>
                        <MenuItem value="M">Masculin</MenuItem>
                        <MenuItem value="F">Féminin</MenuItem>
                        <MenuItem value="A">Autre</MenuItem>
                    </TextField>

                    <TextField
                        select
                        fullWidth
                        label="Type de membre"
                        value={editData.type_membre || ''}
                        onChange={e => setEditData({ ...editData, type_membre: e.target.value })}>
                        <MenuItem value="Citoyen">Citoyen</MenuItem>
                        <MenuItem value="Étudiant">Étudiant</MenuItem>
                        <MenuItem value="Professionnel">Professionnel</MenuItem>
                    </TextField>

                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Prénom"
                            value={editData.first_name || ''}
                            onChange={e => setEditData({ ...editData, first_name: e.target.value })}
                        />
                        <TextField
                            fullWidth
                            label="Nom"
                            value={editData.last_name || ''}
                            onChange={e => setEditData({ ...editData, last_name: e.target.value })}
                        />
                    </Stack>

                    <Divider sx={{ my: 1 }}>Identifiants réseau</Divider>

                    <TextField
                        fullWidth
                        label="Username"
                        value={editData.username || ''}
                        onChange={e => setEditData({ ...editData, username: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Email"
                        value={editData.email || ''}
                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                    />

                    {!showPasswordFields ? (
                        <Button variant="text" size="small" onClick={() => setShowPasswordFields(true)} sx={{ fontWeight: 800 }}>
                            Modifier le mot de passe secret
                        </Button>
                    ) : (
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                label="Nouveau mot de passe"
                                type="password"
                                helperText="Min. 8 caractères, 1 majuscule, 1 chiffre"
                                onChange={e => setEditData({ ...editData, password: e.target.value })}
                            />
                            <TextField
                                fullWidth
                                label="Confirmer"
                                type="password"
                                onChange={e => setEditData({ ...editData, confirmPassword: e.target.value })}
                            />
                            <Button size="small" color="error" onClick={() => setShowPasswordFields(false)}>
                                Annuler changement
                            </Button>
                        </Stack>
                    )}

                    {aModifieDonneesSensibles() && (
                        <Box sx={{ p: 2.5, bgcolor: '#fff4e5', borderRadius: '20px', border: '1px solid #ffe2b7' }}>
                            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 800, mb: 1, display: 'block' }}>
                                CONFIRMATION DE SÉCURITÉ :
                            </Typography>
                            <TextField
                                fullWidth
                                label="Ton mot de passe actuel"
                                type="password"
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                size="small"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} sx={{ fontWeight: 800, color: '#64748b' }}>
                        Fermer
                    </Button>
                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={isUpdating}
                        sx={{ bgcolor: '#16324f', borderRadius: '12px', px: 4, fontWeight: 800 }}>
                        Sauvegarder
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

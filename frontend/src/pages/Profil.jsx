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
    const [currentPassword, setCurrentPassword] = useState('');

    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Fonction pour vérifier si une donnée sensible a été touchée
    const aModifieDonneesSensibles = () => {
        const normalize = (v) => v ?? '';
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
        setErrorMsg('');
        const token = localStorage.getItem('access_token');

        // 1. On prépare les données de base (non sensibles)
        const payload = {
            genre: editData.genre,
            type_membre: editData.type_membre,
            first_name: editData.first_name,
            last_name: editData.last_name,
        };

        let isEmailChanged = false;
        let isPasswordChanged = false;
        let isUsernameChanged = false;

        // 2. Gestion des données sensibles (Username, Email, Password)
        if (aModifieDonneesSensibles()) {
            if (!currentPassword) {
                setErrorMsg(
                    'Veuillez saisir votre mot de passe actuel pour modifier vos identifiants.',
                );
                setIsUpdating(false);
                return;
            }

            // On ajoute le mot de passe de confirmation requis par le backend
            payload.current_password = currentPassword;

            // Si l'email a changé
            if (editData.email !== user.email) {
                payload.email = editData.email;
                isEmailChanged = true;
            }
            // Si l'username a changé
            if (editData.username !== user.username) {
                payload.username = editData.username;
                isUsernameChanged = true;
            }
            // Si on veut changer le mot de passe et que le champ est rempli
            if (showPasswordFields && editData.password) {
                if (editData.password !== editData.confirmPassword) {
                    setErrorMsg(
                        'Les nouveaux mots de passe ne correspondent pas.',
                    );
                    setIsUpdating(false);
                    return;
                }
                payload.password = editData.password;
                isPasswordChanged = true;
            }
        }

        try {
            const response = await fetch('http://localhost:8000/api/me/', {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Si l'email OU le mot de passe a changé, on déconnecte l'utilisateur
                if (isEmailChanged || isPasswordChanged || isUsernameChanged) {
                    if (isEmailChanged) {
                        alert(
                            'Email modifié. Veuillez valider le lien envoyé à votre nouvelle adresse avant de vous reconnecter.',
                        );
                    } else if (isUsernameChanged) {
                        alert(
                            "Nom d'utilisateur modifié. Veuillez valider le lien envoyé à votre nouvelle adresse avant de vous reconnecter.",
                        );
                    } else {
                        alert(
                            'Mot de passe modifié avec succès. Veuillez vous reconnecter avec vos nouveaux identifiants.',
                        );
                    }
                    handleLogout();
                } else {
                    // Sinon, on met à jour l'interface normalement sans déconnecter
                    setUser(data);
                    setOpen(false);
                    setShowPasswordFields(false);
                    setCurrentPassword('');
                    // On nettoie les champs de mot de passe pour la prochaine ouverture
                    setEditData((prev) => ({
                        ...prev,
                        password: '',
                        confirmPassword: '',
                    }));
                }
            } else {
                // Traduction des erreurs backend
                if (data.current_password)
                    setErrorMsg('Mot de passe actuel incorrect.');
                else if (data.username)
                    setErrorMsg("Ce nom d'utilisateur est déjà pris.");
                else if (data.email)
                    setErrorMsg('Cette adresse email est déjà utilisée.');
                else
                    setErrorMsg(
                        data.detail || 'Erreur lors de la mise à jour.',
                    );
            }
        } catch (error) {
            setErrorMsg('Erreur de connexion au serveur.');
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
                <Button
                    size="small"
                    onClick={() => {
                        setEditData({ ...user }); // reset à l'ouverture
                        setShowPasswordFields(false);
                        setCurrentPassword('');
                        setErrorMsg('');
                        setOpen(true);
                    }}
                >
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

                {/* --- INFORMATIONS PRIVEES --- */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Informations privées
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Email :</strong> {user?.email}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Prénom :</strong>{' '}
                        {user?.first_name || 'Non renseigné'}
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Nom :</strong>{' '}
                        {user?.last_name || 'Non renseigné'}
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
                        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

                        {/* --- ZONE LIBRE (Pas besoin de mot de passe) --- */}
                        <Typography variant="overline" color="text.secondary">
                            Préférences
                        </Typography>
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

                        <TextField
                            fullWidth
                            label="Prénom"
                            value={editData.first_name || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    first_name: e.target.value,
                                })
                            }
                        />
                        <TextField
                            fullWidth
                            label="Nom"
                            value={editData.last_name || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    last_name: e.target.value,
                                })
                            }
                        />
                        <Divider sx={{ my: 1 }} />

                        {/* --- ZONE SÉCURISÉE (Détectée par aModifieDonneesSensibles) --- */}
                        <Typography variant="overline" color="primary">
                            Identifiants
                        </Typography>

                        <TextField
                            fullWidth
                            label="Nom d'utilisateur"
                            value={editData.username || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    username: e.target.value,
                                })
                            }
                        />

                        <TextField
                            fullWidth
                            label="Email"
                            value={editData.email || ''}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    email: e.target.value,
                                })
                            }
                        />

                        {!showPasswordFields ? (
                            <Button
                                size="small"
                                onClick={() => setShowPasswordFields(true)}
                            >
                                Changer le mot de passe
                            </Button>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    label="Nouveau mot de passe"
                                    type="password"
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            password: e.target.value,
                                        })
                                    }
                                />
                                <TextField
                                    fullWidth
                                    label="Confirmer nouveau mot de passe"
                                    type="password"
                                    onChange={(e) =>
                                        setEditData({
                                            ...editData,
                                            confirmPassword: e.target.value,
                                        })
                                    }
                                />
                                <Button
                                    size="small"
                                    color="error"
                                    onClick={() => setShowPasswordFields(false)}
                                >
                                    Annuler le changement
                                </Button>
                            </>
                        )}

                        {/* --- CHAMP MOT DE PASSE ACTUEL (Apparaît ou s'active si besoin) --- */}
                        {aModifieDonneesSensibles() && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 2,
                                    bgcolor: '#fff4e5',
                                    borderRadius: 2,
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="warning.main"
                                    sx={{ display: 'block', mb: 1 }}
                                >
                                    Confirmation requise pour modifier vos
                                    identifiants :
                                </Typography>

                                <TextField
                                    fullWidth
                                    required
                                    label="Mot de passe actuel"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) =>
                                        setCurrentPassword(e.target.value)
                                    }
                                    color="warning"
                                />

                                {/* --- BOUTON MOT DE PASSE OUBLIÉ --- */}
                                <Box sx={{ textAlign: 'right', mt: 1 }}>
                                    <Typography
                                        variant="caption"
                                        onClick={() =>
                                            navigate('/mot-de-passe-oublie')
                                        }
                                        sx={{
                                            cursor: 'pointer',
                                            color: 'primary.main',
                                            textDecoration: 'underline',
                                            '&:hover': {
                                                color: 'primary.dark',
                                            },
                                        }}
                                    >
                                        J'ai oublié mon mot de passe
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={() => setOpen(false)}>Annuler</Button>
                        <Button
                            onClick={handleUpdate}
                            variant="contained"
                            disabled={isUpdating}
                        >
                            Sauvegarder
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

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Button,
    Container,
    CircularProgress,
    Snackbar,
    Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chargement, setChargement] = useState(true);

    // États pour la mise à jour de la photo
    const [uploading, setUploading] = useState(false);
    const [notif, setNotif] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/connexion');
                    return;
                }

                const response = await fetch('http://localhost:8000/api/me/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    localStorage.clear();
                    navigate('/connexion');
                }
            } catch (error) {
                console.error('Erreur chargement profil:', error);
            } finally {
                setChargement(false);
            }
        };

        fetchProfil();
    }, [navigate]);

    // --- FONCTION DE MODIFICATION DE LA PHOTO ---
    const handlePhotoChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // 1. Validation rapide (Taille < 2Mo par exemple)
        if (file.size > 2 * 1024 * 1024) {
            setNotif({
                open: true,
                message: "L'image est trop lourde (max 2Mo)",
                severity: 'error',
            });
            return;
        }

        const formData = new FormData();
        formData.append('photo', file); // 'photo' doit correspondre au nom du champ dans Django

        setUploading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await fetch('http://localhost:8000/api/me/', {
                method: 'PATCH', // On utilise PATCH pour ne modifier que la photo
                headers: {
                    Authorization: `Bearer ${token}`,
                    // /!\ NE PAS METTRE Content-Type, le navigateur le fait seul pour FormData
                },
                body: formData,
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                setNotif({
                    open: true,
                    message: 'Photo mise à jour !',
                    severity: 'success',
                });
            } else {
                throw new Error("Erreur serveur lors de l'upload");
            }
        } catch {
            setNotif({
                open: true,
                message: "Échec de l'upload",
                severity: 'error',
            });
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/connexion');
    };

    if (chargement) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
            <Box
                sx={{
                    height: '140px',
                    width: '100%',
                    background:
                        'linear-gradient(135deg, #e0e7ff 0%, #ede9fe 100%)',
                    borderBottom: '1px solid #eaeaea',
                }}
            />

            <Container maxWidth="sm" sx={{ mt: -6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                    <Box sx={{ position: 'relative', width: 104, mb: 2 }}>
                        <Avatar
                            src={user?.photo_url || ''}
                            sx={{
                                width: 104,
                                height: 104,
                                border: '4px solid #ffffff',
                                bgcolor: '#3f51b5',
                                fontSize: '2rem',
                                opacity: uploading ? 0.5 : 1, // Effet visuel pendant l'upload
                            }}
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </Avatar>

                        {/* LOADER SUR L'AVATAR */}
                        {uploading && (
                            <CircularProgress
                                size={24}
                                sx={{ position: 'absolute', top: 40, left: 40 }}
                            />
                        )}

                        <Box
                            component="label"
                            sx={{
                                position: 'absolute',
                                bottom: 0,
                                right: -4,
                                width: 34,
                                height: 34,
                                bgcolor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    bgcolor: '#f9fafb',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        >
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handlePhotoChange}
                                disabled={uploading}
                            />
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#4b5563"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                <circle cx="12" cy="13" r="4"></circle>
                            </svg>
                        </Box>
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight="800"
                            sx={{
                                color: '#111827',
                                letterSpacing: '-0.02em',
                                mb: 0.5,
                            }}
                        >
                            {user?.first_name}{' '}
                            {user?.last_name || user?.username}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: '#6b7280', fontWeight: 500 }}
                        >
                            {user?.email}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        sx={{
                            mt: 3,
                            alignSelf: 'flex-start',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                        }}
                    >
                        Éditer le profil
                    </Button>
                </Box>

                <Box
                    sx={{ height: '1px', bgcolor: '#eaeaea', w: '100%', mb: 4 }}
                />

                {/* --- SECTIONS PARAMETRES (on garde ton design) --- */}
                <Typography
                    variant="overline"
                    sx={{
                        color: '#9ca3af',
                        fontWeight: 700,
                        ml: 1,
                        display: 'block',
                        mb: 1,
                    }}
                >
                    Statistiques de connexion
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid #eaeaea',
                        p: 2,
                        mb: 4,
                    }}
                >
                    <Typography variant="body2">
                        Nombre d'accès : <strong>{user?.nb_acces}</strong>
                    </Typography>
                    <Typography variant="body2">
                        Dernière action :{' '}
                        <strong>
                            {user
                                ? new Date(
                                      user.date_derniere_action,
                                  ).toLocaleDateString()
                                : '--'}
                        </strong>
                    </Typography>
                </Paper>

                <Button
                    fullWidth
                    onClick={handleLogout}
                    sx={{
                        py: 2,
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: '#dc2626',
                        bgcolor: '#fef2f2',
                        '&:hover': { bgcolor: '#fee2e2' },
                    }}
                >
                    Se déconnecter
                </Button>
            </Container>

            {/* MESSAGE DE CONFIRMATION / ERREUR */}
            <Snackbar
                open={notif.open}
                autoHideDuration={4000}
                onClose={() => setNotif({ ...notif, open: false })}
            >
                <Alert severity={notif.severity} sx={{ width: '100%' }}>
                    {notif.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

const Divider = () => <Box sx={{ height: '1px', bgcolor: '#eaeaea', ml: 2 }} />;
const MenuItem = ({ title }) => (
    <Box
        sx={{
            px: 2.5,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#ffffff',
            cursor: 'pointer',
            '&:hover': { bgcolor: '#fafafa' },
        }}
    >
        <Typography
            sx={{ fontWeight: 500, color: '#111827', fontSize: '0.95rem' }}
        >
            {title}
        </Typography>
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d1d5db"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
    </Box>
);

export default Profil;

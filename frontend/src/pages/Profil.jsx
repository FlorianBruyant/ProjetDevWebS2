import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Button,
    Container,
    CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profil = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [chargement, setChargement] = useState(true);

    useEffect(() => {
        const fetchProfil = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/connexion');
                    return;
                }

                // On appelle l'API pour récupérer les infos de l'utilisateur connecté
                // Si ton ami n'a pas encore fait /api/me/, utilise /api/users/id/
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
                    // Si le token est expiré ou invalide
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
                            // Utilise l'initiale si pas de photo
                            src={user?.photo_url || ''}
                            sx={{
                                width: 104,
                                height: 104,
                                border: '4px solid #ffffff',
                                bgcolor: '#3f51b5',
                                fontSize: '2rem',
                            }}
                        >
                            {user?.username?.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box
                            component="label"
                            sx={{
                                /* ... ton style existant ... */ cursor: 'pointer',
                            }}
                        >
                            <input type="file" hidden accept="image/*" />
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
                            {/* VRAIES DONNÉES ICI */}
                            {user?.first_name} {user?.last_name}
                            {!user?.first_name && user?.username}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: '#6b7280', fontWeight: 500 }}
                        >
                            {user?.email}
                        </Typography>
                        {/* Affichage du rôle pour debug */}
                        <Typography
                            variant="caption"
                            sx={{
                                color: '#9ca3af',
                                textTransform: 'uppercase',
                            }}
                        >
                            Rôle : {user?.role || 'Utilisateur'}
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
                            {new Date(
                                user?.date_derniere_action,
                            ).toLocaleDateString()}
                        </strong>
                    </Typography>
                </Paper>

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
                    Paramètres du compte
                </Typography>
                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid #eaeaea',
                        overflow: 'hidden',
                        mb: 4,
                    }}
                >
                    <MenuItem title="Informations personnelles" />
                    <Divider />
                    <MenuItem title="Sécurité et mot de passe" />
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
        </Box>
    );
};

// ... Garde tes sous-composants Divider et MenuItem tels quels ...
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

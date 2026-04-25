import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip,
} from '@mui/material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
    Map,
    Person,
    AccessTime,
    Logout,
    Login,
    Home,
    Assessment,
} from '@mui/icons-material';
import PeopleIcon from '@mui/icons-material/People';

const BarreNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('access_token');
    const role_token = localStorage.getItem('role_token');
    const estConnecte = Boolean(token && token !== 'undefined');

    const handleDeconnexion = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_role');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <AppBar
            position="fixed"
            elevation={10}
            sx={{
                bgcolor: '#111827',
                zIndex: 1100,
                // COMPORTEMENT RESPONSIVE :
                // PC (md) = En haut, Mobile (xs) = En bas
                top: { xs: 'auto', md: 0 },
                bottom: { xs: 0, md: 'auto' },
                borderBottom: { xs: 'none', md: '1px solid #1f2937' },
                borderTop: { xs: '1px solid #1f2937', md: 'none' },
                // Sécurité pour les iPhone récents (encoche du bas)
                pb: { xs: 'env(safe-area-inset-bottom)', md: 0 },
            }}
        >
            {/* ------------------------------------------- */}
            {/* 💻 AFFICHAGE ORDINATEUR (Barre classique)   */}
            {/* ------------------------------------------- */}
            <Toolbar
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'space-between',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate('/')}
                >
                    <Home sx={{ color: '#3b82f6', mr: 1, fontSize: 28 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: '800',
                            letterSpacing: 1,
                            color: 'white',
                        }}
                    >
                        CERGY<span style={{ color: '#3b82f6' }}>LIVE</span>
                    </Typography>
                </Box>

                {estConnecte && (
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            startIcon={<Map />}
                            onClick={() => navigate('/carte')}
                            sx={{
                                color: isActive('/carte') ? '#3b82f6' : 'white',
                                fontWeight: isActive('/carte')
                                    ? 'bold'
                                    : 'normal',
                            }}
                        >
                            Carte Interactive
                        </Button>
                        <Button
                            startIcon={<AccessTime />}
                            onClick={() => navigate('/horaires')}
                            sx={{
                                color: isActive('/horaires')
                                    ? '#3b82f6'
                                    : 'white',
                                fontWeight: isActive('/horaires')
                                    ? 'bold'
                                    : 'normal',
                            }}
                        >
                            Horaires
                        </Button>
                        {(role_token === 'ADMIN' ||
                            role_token === 'COMPLEXE') && (
                            <Button
                                startIcon={<Assessment />}
                                onClick={() => navigate('/stats')}
                                sx={{
                                    color: isActive('/stats')
                                        ? '#3b82f6'
                                        : 'white',
                                    fontWeight: isActive('/stats')
                                        ? 'bold'
                                        : 'normal',
                                    textTransform: 'none',
                                }}
                            >
                                Statistiques
                            </Button>
                        )}
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {estConnecte ? (
                        <>
                            <Button
                                onClick={() => navigate('/membres')}
                                startIcon={<PeopleIcon />}
                                sx={{
                                    color: isActive('/profil')
                                        ? '#3b82f6'
                                        : 'white',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                Membres
                            </Button>
                            <Button
                                startIcon={<Person />}
                                onClick={() => navigate('/profil')}
                                sx={{
                                    color: isActive('/profil')
                                        ? '#3b82f6'
                                        : 'white',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                }}
                            >
                                Profil
                            </Button>
                            <Tooltip title="Déconnexion">
                                <IconButton
                                    onClick={handleDeconnexion}
                                    sx={{
                                        color: '#ef4444',
                                        ml: 1,
                                        bgcolor: 'rgba(239, 68, 68, 0.1)',
                                        '&:hover': {
                                            bgcolor: 'rgba(239, 68, 68, 0.2)',
                                        },
                                    }}
                                >
                                    <Logout fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            startIcon={<Login />}
                            onClick={() => navigate('/connexion')}
                            sx={{
                                bgcolor: '#3b82f6',
                                '&:hover': { bgcolor: '#2563eb' },
                                fontWeight: 'bold',
                                textTransform: 'none',
                                borderRadius: 2,
                            }}
                        >
                            Connexion
                        </Button>
                    )}
                </Box>
            </Toolbar>

            {/* ------------------------------------------- */}
            {/* 📱 AFFICHAGE MOBILE (Tab Bar icônes)        */}
            {/* ------------------------------------------- */}
            <Toolbar
                sx={{
                    display: { xs: 'flex', md: 'none' },
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    minHeight: '65px',
                    px: 1,
                }}
            >
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        color: isActive('/') ? '#3b82f6' : '#9ca3af',
                        flexDirection: 'column',
                        p: 1,
                    }}
                >
                    <Home fontSize="small" />
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.65rem',
                            mt: 0.5,
                            fontWeight: isActive('/') ? 'bold' : 'normal',
                        }}
                    >
                        Accueil
                    </Typography>
                </IconButton>

                {estConnecte && (
                    <>
                        <IconButton
                            onClick={() => navigate('/carte')}
                            sx={{
                                color: isActive('/carte')
                                    ? '#3b82f6'
                                    : '#9ca3af',
                                flexDirection: 'column',
                                p: 1,
                            }}
                        >
                            <Map fontSize="small" />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                    fontWeight: isActive('/carte')
                                        ? 'bold'
                                        : 'normal',
                                }}
                            >
                                Carte
                            </Typography>
                        </IconButton>
                        <IconButton
                            onClick={() => navigate('/horaires')}
                            sx={{
                                color: isActive('/horaires')
                                    ? '#3b82f6'
                                    : '#9ca3af',
                                flexDirection: 'column',
                                p: 1,
                            }}
                        >
                            <AccessTime fontSize="small" />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                    fontWeight: isActive('/horaires')
                                        ? 'bold'
                                        : 'normal',
                                }}
                            >
                                Horaires
                            </Typography>
                        </IconButton>
                        {(role_token === 'ADMIN' ||
                            role_token === 'COMPLEXE') && (
                            <IconButton
                                onClick={() => navigate('/stats')}
                                sx={{
                                    color: isActive('/stats')
                                        ? '#3b82f6'
                                        : '#9ca3af',
                                    flexDirection: 'column',
                                    p: 1,
                                }}
                            >
                                <Assessment fontSize="small" />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: '0.65rem',
                                        mt: 0.5,
                                        fontWeight: isActive('/stats')
                                            ? 'bold'
                                            : 'normal',
                                    }}
                                >
                                    Stats
                                </Typography>
                            </IconButton>
                        )}
                        <IconButton
                            onClick={() => navigate('/membres')}
                            sx={{
                                color: isActive('/profil')
                                    ? '#3b82f6'
                                    : '#9ca3af',
                                flexDirection: 'column',
                                p: 1,
                            }}
                        >
                            <PeopleIcon fontSize="small" />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                    fontWeight: isActive('/profil')
                                        ? 'bold'
                                        : 'normal',
                                }}
                            >
                                Membres
                            </Typography>
                        </IconButton>
                        <IconButton
                            onClick={() => navigate('/profil')}
                            sx={{
                                color: isActive('/profil')
                                    ? '#3b82f6'
                                    : '#9ca3af',
                                flexDirection: 'column',
                                p: 1,
                            }}
                        >
                            <Person fontSize="small" />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontSize: '0.65rem',
                                    mt: 0.5,
                                    fontWeight: isActive('/profil')
                                        ? 'bold'
                                        : 'normal',
                                }}
                            >
                                Profil
                            </Typography>
                        </IconButton>
                        <IconButton
                            onClick={handleDeconnexion}
                            sx={{
                                color: '#ef4444',
                                flexDirection: 'column',
                                p: 1,
                            }}
                        >
                            <Logout fontSize="small" />
                            <Typography
                                variant="caption"
                                sx={{ fontSize: '0.65rem', mt: 0.5 }}
                            >
                                Quitter
                            </Typography>
                        </IconButton>
                    </>
                )}

                {!estConnecte && (
                    <IconButton
                        onClick={() => navigate('/connexion')}
                        sx={{ color: '#3b82f6', flexDirection: 'column', p: 1 }}
                    >
                        <Login fontSize="small" />
                        <Typography
                            variant="caption"
                            sx={{
                                fontSize: '0.65rem',
                                mt: 0.5,
                                fontWeight: 'bold',
                            }}
                        >
                            Connexion
                        </Typography>
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default BarreNavigation;

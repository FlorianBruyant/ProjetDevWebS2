import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Button,
    Container,
} from '@mui/material';

const Profil = () => {
    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pb: 12 }}>
            {/* COUVERTURE (Cover photo style Twitter/Airbnb) */}
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
                {/* ZONE AVATAR & INFOS */}
                <Box sx={{ display: 'flex', flexDirection: 'column', mb: 4 }}>
                    {/* Conteneur de l'Avatar avec le bouton Modifier */}
                    <Box sx={{ position: 'relative', width: 104, mb: 2 }}>
                        <Avatar
                            src="https://i.pravatar.cc/150?img=68" // Ta photo ici
                            sx={{
                                width: 104,
                                height: 104,
                                border: '4px solid #ffffff',
                                bgcolor: '#f3f4f6',
                            }}
                        />
                        {/* Bouton pour changer la photo de profil */}
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
                            {/* Input file caché pour l'upload (fonctionnel si tu branches la logique) */}
                            <input type="file" hidden accept="image/*" />
                            {/* Icône Appareil Photo SVG pure */}
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

                    {/* Informations Utilisateur */}
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
                            Alex Dubois
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{ color: '#6b7280', fontWeight: 500 }}
                        >
                            alex.dubois@email.com
                        </Typography>
                    </Box>

                    {/* Bouton Éditer le profil */}
                    <Button
                        variant="outlined"
                        sx={{
                            mt: 3,
                            alignSelf: 'flex-start',
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            color: '#111827',
                            borderColor: '#d1d5db',
                            px: 3,
                            '&:hover': {
                                bgcolor: '#f3f4f6',
                                borderColor: '#d1d5db',
                            },
                        }}
                    >
                        Éditer le profil
                    </Button>
                </Box>

                {/* SÉPARATEUR */}
                <Box
                    sx={{ height: '1px', bgcolor: '#eaeaea', w: '100%', mb: 4 }}
                />

                {/* SECTION : MON COMPTE (Style iOS / Linear) */}
                <Typography
                    variant="overline"
                    sx={{
                        color: '#9ca3af',
                        fontWeight: 700,
                        letterSpacing: 1.2,
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
                    <MenuItem title="Moyens de paiement" />
                    <Divider />
                    <MenuItem title="Sécurité et mot de passe" />
                </Paper>

                {/* SECTION : PRÉFÉRENCES */}
                <Typography
                    variant="overline"
                    sx={{
                        color: '#9ca3af',
                        fontWeight: 700,
                        letterSpacing: 1.2,
                        ml: 1,
                        display: 'block',
                        mb: 1,
                    }}
                >
                    Préférences
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        borderRadius: '16px',
                        border: '1px solid #eaeaea',
                        overflow: 'hidden',
                        mb: 5,
                    }}
                >
                    <MenuItem title="Notifications" />
                    <Divider />
                    <MenuItem title="Aide et support" />
                </Paper>

                {/* BOUTON DÉCONNEXION */}
                <Button
                    fullWidth
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

// --- SOUS-COMPOSANTS PURS ---

// Séparateur ultra fin pour les listes
const Divider = () => <Box sx={{ height: '1px', bgcolor: '#eaeaea', ml: 2 }} />;

// Composant de menu avec icône SVG Chevron "Apple style"
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
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#fafafa' },
        }}
    >
        <Typography
            sx={{ fontWeight: 500, color: '#111827', fontSize: '0.95rem' }}
        >
            {title}
        </Typography>

        {/* Chevron pure SVG (zéro import MUI) */}
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

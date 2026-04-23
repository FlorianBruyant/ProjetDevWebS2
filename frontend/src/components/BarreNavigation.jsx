import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
    Home as HomeIcon,
    Map as MapIcon,
    AccessTime, // 🚨 NOUVELLE ICÔNE (Horloge)
    Settings,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const BarreNavigation = () => {
    const location = useLocation();

    const getValeurActive = () => {
        if (location.pathname === '/') return 0;
        if (location.pathname === '/carte') return 1;
        if (location.pathname === '/horaires') return 2; // 🚨 CORRECTION ICI
        if (location.pathname === '/profil') return 3;
        return 0;
    };

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                // Design moderne et épuré (Glassmorphism clair)
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)', // Support Safari
                borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                // Ombre très douce pour décoller la barre du contenu
                boxShadow: '0px -2px 20px rgba(0, 0, 0, 0.04)',
            }}
            elevation={0}
        >
            <BottomNavigation
                showLabels
                value={getValeurActive()}
                sx={{
                    background: 'transparent',
                    height: '70px',
                    '& .MuiBottomNavigationAction-root': {
                        color: '#9ca3af', // Gris doux pour les icônes inactives
                        transition: 'color 0.2s ease-in-out',
                        minWidth: 'auto',
                        padding: '8px 0',
                        '&:hover': {
                            color: '#6b7280',
                        },
                    },
                    // Style de l'élément actif
                    '& .Mui-selected': {
                        color: '#2563eb !important', // Bleu moderne et dynamique
                        '& .MuiSvgIcon-root': {
                            // Légère élévation sans effet néon
                            transform: 'translateY(-2px)',
                            transition: 'transform 0.2s ease-in-out',
                        },
                    },
                    '& .MuiBottomNavigationAction-label': {
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginTop: '4px',
                        transition: 'all 0.2s ease-in-out',
                    },
                }}
            >
                <BottomNavigationAction
                    component={Link}
                    to="/"
                    label="Accueil"
                    icon={<HomeIcon />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/carte"
                    label="Carte"
                    icon={<MapIcon />}
                />
                {/* 🚨 LE BOUTON HORAIRES EST ICI */}
                <BottomNavigationAction
                    component={Link}
                    to="/horaires"
                    label="Horaires"
                    icon={<AccessTime />}
                />
                <BottomNavigationAction
                    component={Link}
                    to="/profil"
                    label="Profil"
                    icon={<Settings />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default BarreNavigation;

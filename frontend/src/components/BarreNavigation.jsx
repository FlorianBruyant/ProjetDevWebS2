import React from 'react';
import { Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import {
    Home as HomeIcon,
    Map as MapIcon,
    ConfirmationNumber,
    Settings,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const BarreNavigation = () => {
    const location = useLocation();

    // On détermine quel bouton est actif en fonction de l'URL actuelle
    const getValeurActive = () => {
        if (location.pathname === '/') return 0;
        if (location.pathname === '/carte') return 1;
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
                borderTop: '1px solid #eee',
            }}
            elevation={3}
        >
            <BottomNavigation showLabels value={getValeurActive()}>
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
                <BottomNavigationAction
                    component={Link}
                    to="/tickets"
                    label="Tickets"
                    icon={<ConfirmationNumber />}
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

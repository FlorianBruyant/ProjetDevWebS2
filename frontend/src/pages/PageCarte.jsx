import React from 'react';
import { Box, Paper, TextField, InputAdornment } from '@mui/material';
import {
    Search,
    Map as MapIcon,
    ConfirmationNumber,
    Settings,
    Home as HomeIcon,
} from '@mui/icons-material';
import 'leaflet/dist/leaflet.css';
import Carte from '../components/Carte';

const PageCarte = () => {
    return (
        // --- BOX PRINCIPALE (Prend toute la hauteur de l'écran) ---
        <Box
            sx={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* --- LA CARTE (En arrière-plan, plein écran) --- */}
            <Box sx={{ flex: 1, zIndex: 0 }}>
                <Carte />{' '}
                {/* La carte prendra tout l'espace disponible (flex: 1) */}
            </Box>

            {/* --- BARRE DE RECHERCHE (Superposée en haut) --- */}
            {/* C'est le bloc 'Carte' avec l'icône loupe sur ton dessin */}
            <Paper
                elevation={3}
                sx={{
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '90%',
                    maxWidth: 600,
                    borderRadius: 30,
                    bgcolor: 'rgba(255, 255, 255, 0.95)', // Légère transparence
                    p: 1,
                    zIndex: 1000, // Pour passer au-dessus de la carte
                }}
            >
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Rechercher sur la carte..."
                    InputProps={{
                        disableUnderline: true, // Cache la ligne de soulignement
                        startAdornment: (
                            <InputAdornment position="start" sx={{ pl: 1 }}>
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>
        </Box>
    );
};

export default PageCarte;

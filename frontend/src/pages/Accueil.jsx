import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    InputBase,
    Chip,
    Grid,
    IconButton,
    Paper,
    List,
    Container,
} from '@mui/material';
import {
    Search,
    Traffic,
    LocalParking,
    DirectionsBus,
    Train,
    WarningAmberRounded,
    ConstructionRounded,
} from '@mui/icons-material';
import Carte from '../components/Carte';

const Accueil = () => {
    const navigate = useNavigate();
    const [saisie, setSaisie] = useState('');

    const envoyerVersCarte = (e) => {
        if (e) e.preventDefault();
        navigate('/carte', {
            state: {
                focusRecherche: true,
                texteInitial: saisie,
            },
        });
    };

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', pb: 12 }}>
            {/* Conteneur principal pour limiter la largeur sur grand écran (Desktop) tout en prenant 100% sur mobile */}
            <Container
                maxWidth="md"
                disableGutters
                sx={{ px: { xs: 2, sm: 3 } }}
            >
                {/* HEADER */}
                <Box
                    sx={{
                        pt: 5,
                        pb: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            color="text.secondary"
                            fontWeight="600"
                            letterSpacing={1.5}
                        >
                            Bonjour, Utilisateur
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight="800"
                            sx={{ color: '#111827', mt: -0.5 }}
                        >
                            Cergy
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: '#2563eb',
                            color: '#fff',
                            width: 48,
                            height: 48,
                            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
                        }}
                    >
                        U
                    </Avatar>
                </Box>

                {/* BARRE DE RECHERCHE */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        component="form"
                        onSubmit={envoyerVersCarte}
                        elevation={0}
                        sx={{
                            p: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.2s ease',
                            '&:focus-within': {
                                border: '1px solid #2563eb',
                                boxShadow:
                                    '0px 4px 20px rgba(37, 99, 235, 0.1)',
                            },
                        }}
                    >
                        <IconButton
                            sx={{ p: '10px', color: '#6b7280' }}
                            onClick={envoyerVersCarte}
                        >
                            <Search />
                        </IconButton>
                        <InputBase
                            sx={{
                                ml: 1,
                                flex: 1,
                                fontSize: '1rem',
                                color: '#1f2937',
                            }}
                            placeholder="Où allez-vous à Cergy ?"
                            value={saisie}
                            onChange={(e) => setSaisie(e.target.value)}
                        />
                    </Paper>
                </Box>

                {/* APERÇU CARTE */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: 220,
                            bgcolor: '#e5e7eb',
                            borderRadius: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid #f3f4f6',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
                        }}
                    >
                        {/* Composant Carte - Assurez-vous qu'il prend 100% de la hauteur parent */}
                        <Box
                            sx={{ height: '100%', width: '100%', opacity: 0.9 }}
                        >
                            <Carte hauteur="220px" />
                        </Box>

                        {/* Bouton Overlay style Glassmorphism */}
                        <Chip
                            label="Ouvrir la carte"
                            onClick={() => navigate('/carte')}
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: '#111827',
                                fontWeight: '700',
                                py: 2.5,
                                px: 1,
                                borderRadius: '12px',
                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#ffffff',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                    </Paper>
                </Box>

                {/* FILTRES */}
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        gap: 1.5,
                        overflowX: 'auto',
                        pb: 1,
                        // Masquer la barre de défilement tout en gardant le scroll
                        '&::-webkit-scrollbar': { display: 'none' },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                    }}
                >
                    <FilterChip label="Tout" active />
                    <FilterChip label="Trafic" />
                    <FilterChip label="Transports" />
                    <FilterChip label="Parkings" />
                </Box>

                {/* GRILLE EVENEMENTS */}
                <Box sx={{ mb: 5 }}>
                    <Grid container spacing={2}>
                        {/* 🚨 CORRECTION : On a juste retiré le mot "item" de chaque Grid ! */}
                        <Grid xs={6} md={3}>
                            <StatusCard
                                icon={<Traffic />}
                                title="Trafic"
                                val="Modéré"
                                sub="3 incidents"
                                color="#ea580c"
                                bgColor="#ffedd5"
                            />
                        </Grid>
                        <Grid xs={6} md={3}>
                            <StatusCard
                                icon={<LocalParking />}
                                title="Parkings"
                                val="847"
                                sub="places dispo."
                                color="#16a34a"
                                bgColor="#dcfce7"
                            />
                        </Grid>
                        <Grid xs={6} md={3}>
                            <StatusCard
                                icon={<DirectionsBus />}
                                title="Bus C3"
                                val="3 min"
                                sub="À l'heure"
                                color="#16a34a"
                                bgColor="#dcfce7"
                            />
                        </Grid>
                        <Grid xs={6} md={3}>
                            <StatusCard
                                icon={<Train />}
                                title="Métro A"
                                val="2 min"
                                sub="+2 min retard"
                                color="#dc2626"
                                bgColor="#fee2e2"
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ALERTES */}
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight="800"
                        sx={{ color: '#111827', mb: 2 }}
                    >
                        Alertes en direct
                    </Typography>
                    <List
                        disablePadding
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        }}
                    >
                        <AlertItem
                            icon={<ConstructionRounded />}
                            title="Travaux : Bd du Port"
                            date="Jusqu'au 28 avr."
                            status="Actif"
                            color="#ea580c"
                            bgColor="#ffedd5"
                        />
                        <AlertItem
                            icon={<WarningAmberRounded />}
                            title="Accident : A15 vers Paris"
                            date="+18 min de trajet"
                            status="Urgent"
                            color="#dc2626"
                            bgColor="#fee2e2"
                        />
                    </List>
                </Box>
            </Container>
        </Box>
    );
};

// --- SOUS-COMPOSANTS DESIGN MODERNE ---

const FilterChip = ({ label, active }) => (
    <Chip
        label={label}
        sx={{
            bgcolor: active ? '#111827' : '#ffffff',
            color: active ? '#ffffff' : '#4b5563',
            border: active ? 'none' : '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '0.875rem',
            px: 1,
            py: 2,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
                bgcolor: active ? '#1f2937' : '#f3f4f6',
            },
        }}
    />
);

const StatusCard = ({ icon, title, val, sub, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: '16px',
            border: '1px solid #f3f4f6',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.04)',
            },
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box
                sx={{
                    bgcolor: bgColor,
                    color: color,
                    p: 0.8,
                    borderRadius: '8px',
                    display: 'flex',
                    mr: 1.5,
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Typography variant="body2" fontWeight="600" color="text.secondary">
                {title}
            </Typography>
        </Box>
        <Typography
            variant="h5"
            fontWeight="800"
            sx={{ color: '#111827', mb: 0.2 }}
        >
            {val}
        </Typography>
        <Typography variant="caption" fontWeight="600" sx={{ color: color }}>
            {sub}
        </Typography>
    </Paper>
);

const AlertItem = ({ icon, title, date, status, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderRadius: '16px',
            border: '1px solid #f3f4f6',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)',
            borderLeft: `4px solid ${color}`, // Accent sur la gauche
        }}
    >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    bgcolor: bgColor,
                    color: color,
                    p: 1,
                    borderRadius: '10px',
                    display: 'flex',
                    mr: 2,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography
                    variant="body1"
                    fontWeight="700"
                    sx={{ color: '#111827' }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="caption"
                    fontWeight="500"
                    color="text.secondary"
                >
                    {date}
                </Typography>
            </Box>
        </Box>
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bgColor,
                color: color,
                fontWeight: '700',
                borderRadius: '6px',
            }}
        />
    </Paper>
);

export default Accueil;

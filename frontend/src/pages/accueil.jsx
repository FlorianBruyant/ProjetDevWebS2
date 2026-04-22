import React from 'react';
import {
    Box,
    Typography,
    Avatar,
    TextField,
    InputAdornment,
    Chip,
    Grid,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Paper,
    BottomNavigation,
    BottomNavigationAction,
} from '@mui/material';
import {
    Search,
    Map as MapIcon,
    Traffic,
    LocalParking,
    DirectionsBus,
    Train,
    Home as HomeIcon,
    ConfirmationNumber,
    Settings,
} from '@mui/icons-material';

const Accueil = () => {
    return (
        <Box sx={{ pb: 10, bgcolor: '#f8fafd', minHeight: '100vh' }}>
            {/* HEADER */}
            <Box
                sx={{
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        Bonjour, [Nom_utilisateur]
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                        Cergy
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#eef2ff', color: '#3b82f6' }}>N</Avatar>
            </Box>

            {/* RECHERCHE */}
            <Box sx={{ px: 2, mb: 3 }}>
                <TextField
                    fullWidth
                    placeholder="Rechercher un lieu, une ligne..."
                    variant="outlined"
                    sx={{ bgcolor: 'white', borderRadius: 2 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="disabled" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
            </Box>

            {/* PREVIEW CARTE */}
            <Box sx={{ px: 2, mb: 3 }}>
                <Paper
                    elevation={0}
                    sx={{
                        height: 150,
                        bgcolor: '#dbeafe',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        p: 2,
                    }}
                >
                    <Chip
                        label="Ouvrir la carte ↗"
                        sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                        onClick={() => {}}
                    />
                </Paper>
            </Box>

            {/* FILTRES */}
            <Box
                sx={{
                    px: 2,
                    mb: 3,
                    display: 'flex',
                    gap: 1,
                    overflowX: 'auto',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                <Chip label="Tout" color="primary" />
                <Chip label="Trafic" variant="outlined" />
                <Chip label="Bus / Métro" variant="outlined" />
                <Chip label="Parkings" variant="outlined" />
            </Box>

            {/* GRILLE EVENEMENTS */}
            <Box sx={{ px: 2, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid xs={6}>
                        <StatusCard
                            icon={<Traffic />}
                            title="Trafic"
                            val="Modéré"
                            sub="3 incidents"
                            color="#f97316"
                        />
                    </Grid>
                    <Grid xs={6}>
                        <StatusCard
                            icon={<LocalParking />}
                            title="Parkings"
                            val="847"
                            sub="places dispo."
                            color="#22c55e"
                        />
                    </Grid>
                    <Grid xs={6}>
                        <StatusCard
                            icon={<DirectionsBus />}
                            title="Bus C3"
                            val="3 min"
                            sub="À l'heure"
                            color="#22c55e"
                        />
                    </Grid>
                    <Grid xs={6}>
                        <StatusCard
                            icon={<Train />}
                            title="Métro A"
                            val="2 min"
                            sub="+2 min retard"
                            color="#ef4444"
                        />
                    </Grid>
                </Grid>
            </Box>

            {/* ALERTES */}
            <Box sx={{ px: 2 }}>
                <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight="bold"
                >
                    Alertes
                </Typography>
                <List disablePadding>
                    <AlertItem
                        title="Travaux : Bd du Port"
                        date="Jusqu'au 28 avr."
                        status="Actif"
                        color="orange"
                    />
                    <AlertItem
                        title="Accident : A15 vers Paris"
                        date="+18 min"
                        status="Urgent"
                        color="red"
                    />
                </List>
            </Box>

            {/* BOTTOM NAV */}
            <Paper
                sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
                elevation={3}
            >
                <BottomNavigation showLabels value={0}>
                    <BottomNavigationAction
                        label="Accueil"
                        icon={<HomeIcon />}
                    />
                    <BottomNavigationAction label="Carte" icon={<MapIcon />} />
                    <BottomNavigationAction
                        label="Tickets"
                        icon={<ConfirmationNumber />}
                    />
                    <BottomNavigationAction
                        label="Profil"
                        icon={<Settings />}
                    />
                </BottomNavigation>
            </Paper>
        </Box>
    );
};

// Sous-composant pour les cartes de statut
const StatusCard = ({ icon, title, val, sub, color }) => (
    <Card variant="outlined" sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            <Box
                sx={{
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                }}
            >
                {React.cloneElement(icon, { sx: { fontSize: 18, mr: 0.5 } })}
                <Typography variant="caption">{title}</Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold" sx={{ color: color }}>
                {val}
            </Typography>
            <Typography variant="caption" color="text.secondary">
                {sub}
            </Typography>
        </CardContent>
    </Card>
);

// Sous-composant pour les alertes
const AlertItem = ({ title, date, status, color }) => (
    <Card variant="outlined" sx={{ mb: 1, borderRadius: 3 }}>
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
            }}
        >
            <Box>
                <Typography variant="body2" fontWeight="bold">
                    {title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {date}
                </Typography>
            </Box>
            <Chip
                label={status}
                size="small"
                sx={{
                    bgcolor: color === 'red' ? '#fee2e2' : '#fff7ed',
                    color: color,
                    fontWeight: 'bold',
                }}
            />
        </Box>
    </Card>
);

export default Accueil;

import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Paper, Container } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrafficIcon from '@mui/icons-material/Traffic';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import PsychologyIcon from '@mui/icons-material/Psychology';

// Import des futurs composants (on les créera juste après)
// import TableGestion from '../components/TableGestion';

const PageGestion = () => {
    const [currentTab, setCurrentTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#2c3e50' }}>
                ⚙️ Centre de Commandement
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Gérez les équipements de la ville et configurez les scénarios d'automatisation.
            </Typography>

            <Paper elevation={3} sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <Tabs
                    value={currentTab}
                    onChange={handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                    sx={{
                        borderBottom: 1,
                        borderColor: 'divider',
                        bgcolor: '#f8f9fa',
                    }}>
                    <Tab icon={<DirectionsCarIcon />} label="Véhicules" />
                    <Tab icon={<TrafficIcon />} label="Feux" />
                    <Tab icon={<LocalParkingIcon />} label="Parkings" />
                    <Tab icon={<PsychologyIcon />} label="Scénarios" />
                </Tabs>

                <Box sx={{ p: 3 }}>
                    {/* Contenu dynamique selon l'onglet */}
                    {currentTab === 0 && (
                        <Box>
                            <Typography variant="h6">🚗 Liste des Véhicules</Typography>
                            {/* On mettra ici le composant TableGestion type="vehicules" */}
                        </Box>
                    )}

                    {currentTab === 1 && (
                        <Box>
                            <Typography variant="h6">🚦 Gestion des Feux</Typography>
                            {/* On mettra ici le composant TableGestion type="feux" */}
                        </Box>
                    )}

                    {currentTab === 2 && (
                        <Box>
                            <Typography variant="h6">🅿️ Occupation des Parkings</Typography>
                            {/* On mettra ici le composant TableGestion type="parkings" */}
                        </Box>
                    )}

                    {currentTab === 3 && (
                        <Box>
                            <Typography variant="h6">🧠 Intelligence des Scénarios</Typography>
                            {/* On mettra ici la gestion des scénarios */}
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default PageGestion;

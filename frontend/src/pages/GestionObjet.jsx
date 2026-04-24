import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Container,
    Paper,
    Tabs,
    Tab,
    Button,
    Chip,
    Divider,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// --- MODULE 1 : GESTION (CRUD) ---
const ModuleGestion = () => (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
            1. Gestion de l'Objet
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }} color="text.secondary">
            Modifier les informations, contrôler l'état (ON/OFF) ou supprimer
            l'objet.
        </Typography>
        <Typography>Le formulaire de modification viendra ici...</Typography>
    </Box>
);

// --- MODULE 2 : CONFIGURATION ---
const ModuleConfiguration = () => (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
            2. Configuration des Services
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }} color="text.secondary">
            Associer à une zone géographique et créer des scénarios
            d'automatisation.
        </Typography>
        <Typography>
            La gestion des règles (Si X alors Y) viendra ici...
        </Typography>
    </Box>
);

// --- MODULE 3 : SURVEILLANCE ---
const ModuleSurveillance = () => (
    <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
            3. Surveillance et Optimisation
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }} color="text.secondary">
            Visualiser la consommation énergétique, les performances et les
            alertes.
        </Typography>
        <Typography>
            Les graphiques et tableaux de bord viendront ici...
        </Typography>
    </Box>
);

// --- PAGE PRINCIPALE ---
export default function GestionObjet() {
    const { id } = useParams(); // Récupère l'ID passé dans l'URL (ex: /objet/4)
    const navigate = useNavigate();
    const [tabActif, setTabActif] = useState(0);

    // On changera d'onglet en fonction du clic
    const handleChangeTab = (event, newValue) => {
        setTabActif(newValue);
    };

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', py: 4, mt: 8 }}>
            <Container maxWidth="md">
                {/* Bouton retour */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/carte')}
                    sx={{ mb: 2 }}
                >
                    Retour à la carte
                </Button>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 2,
                        }}
                    >
                        <Typography variant="h4" fontWeight="bold">
                            Objet #{id}
                        </Typography>
                        <Chip label="Connecté" color="success" />
                    </Box>
                    <Divider sx={{ mb: 2 }} />

                    {/* Navigation des onglets */}
                    <Tabs
                        value={tabActif}
                        onChange={handleChangeTab}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                    >
                        <Tab label="Gestion (CRUD)" />
                        <Tab label="Configuration" />
                        <Tab label="Surveillance" />
                    </Tabs>

                    {/* Affichage du composant correspondant à l'onglet actif */}
                    <Box sx={{ minHeight: '300px' }}>
                        {tabActif === 0 && <ModuleGestion />}
                        {tabActif === 1 && <ModuleConfiguration />}
                        {tabActif === 2 && <ModuleSurveillance />}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

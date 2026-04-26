import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, Snackbar, Alert, Slide, Typography, Stack } from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

// Import de tes pages...
import Accueil from './pages/Accueil';
import PageCarte from './pages/PageCarte';
import Inscription from './pages/Inscription';
import Profil from './pages/Profil';
import Connexion from './pages/Connexion';
import Membres from './pages/Membres';
import ProfilMembre from './pages/ProfilMembre';
import BarreNavigation from './components/BarreNavigation';
import Horaires from './pages/Horaires';
import ConfirmEmail from './components/ConfirmEmail';
import DemandeReset from './pages/DemandeReset';
import NouveauMotDePasse from './components/NouveauMotDePasse';
import GestionObjet from './pages/GestionObjet';
import Dashboard from './pages/Dashboard';

const RouteProtegee = ({ children, rolesAutorises = [] }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role_token');
    if (!token || token === 'undefined') return <Navigate to="/connexion" replace />;
    if (rolesAutorises.length > 0 && !rolesAutorises.includes(userRole)) return <Navigate to="/carte" replace />;
    return children;
};

function App() {
    const [notification, setNotification] = useState({ open: false, message: '', severity: 'error', type: '' });
    const [idsNotifies, setIdsNotifies] = useState(new Set());

    // --- SURVEILLANCE TOTALE DU RÉSEAU ---
    useEffect(() => {
        const scannerLeReseau = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/map/global/');
                if (response.ok) {
                    const data = await response.json();

                    // On filtre ABSOLUMENT TOUT ce qui est "en_panne"
                    const pannesDetectees = data.filter(item => item.en_panne);

                    pannesDetectees.forEach(objet => {
                        const uniqueKey = `${objet.type_api}-${objet.id}`;

                        // Si on n'a pas encore notifié cette panne précise
                        if (!idsNotifies.has(uniqueKey)) {
                            // Traduction du type pour l'utilisateur
                            const labels = {
                                vehicules: 'VÉHICULE',
                                feux: 'SIGNALISATION',
                                parkings: 'PARKING',
                                evenements: 'INCIDENT ROUTIER',
                                lieux: 'LIEU PUBLIC',
                            };

                            setNotification({
                                open: true,
                                message: `${labels[objet.type_api] || 'ÉQUIPEMENT'} : ${objet.nom}`,
                                severity: objet.type_api === 'evenements' || objet.type_api === 'feux' ? 'error' : 'warning',
                                type: labels[objet.type_api] || 'ALERTE',
                            });

                            // On enregistre pour ne pas re-notifier la même panne
                            setIdsNotifies(prev => new Set(prev).add(uniqueKey));
                        }
                    });
                }
            } catch (error) {
                console.error('Erreur Sentinel:', error);
            }
        };

        const interval = setInterval(scannerLeReseau, 8000); // Scan toutes les 8 secondes
        return () => clearInterval(interval);
    }, [idsNotifies]);

    return (
        <Router>
            <BarreNavigation />
            <Box sx={{ pb: { xs: '80px', md: 0 }, pt: { xs: 0, md: '64px' }, minHeight: '100vh' }}>
                <Routes>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route path="/confirmer-email/:uid/:token" element={<ConfirmEmail />} />
                    <Route path="/mot-de-passe-oublie" element={<DemandeReset />} />
                    <Route path="/reset-password/:uid/:token" element={<NouveauMotDePasse />} />
                    <Route
                        path="/carte"
                        element={
                            <RouteProtegee>
                                <PageCarte />
                            </RouteProtegee>
                        }
                    />
                    <Route
                        path="/profil"
                        element={
                            <RouteProtegee>
                                <Profil />
                            </RouteProtegee>
                        }
                    />
                    <Route
                        path="/horaires"
                        element={
                            <RouteProtegee>
                                <Horaires />
                            </RouteProtegee>
                        }
                    />
                    <Route
                        path="/objet/:type_api/:id"
                        element={
                            <RouteProtegee>
                                <GestionObjet />
                            </RouteProtegee>
                        }
                    />
                    <Route
                        path="/stats"
                        element={
                            <RouteProtegee rolesAutorises={['ADMIN', 'COMPLEXE']}>
                                <Dashboard />
                            </RouteProtegee>
                        }
                    />
                    <Route path="/membres" element={<Membres />} />
                    <Route path="/profil/:id" element={<ProfilMembre />} />
                </Routes>
            </Box>

            {/* --- SNACKBAR D'ALERTE CRITIQUE --- */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={() => setNotification({ ...notification, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                TransitionComponent={props => <Slide {...props} direction="left" />}
                sx={{ mt: 7 }}>
                <Alert
                    severity={notification.severity}
                    variant="filled"
                    icon={<WarningAmberRoundedIcon fontSize="inherit" />}
                    sx={{
                        width: '320px',
                        borderRadius: '12px',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.3)',
                    }}>
                    <Stack>
                        <Typography variant="caption" sx={{ fontWeight: 900, opacity: 0.8, letterSpacing: 1 }}>
                            PANNE RÉSEAU - {notification.type}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {notification.message}
                        </Typography>
                    </Stack>
                </Alert>
            </Snackbar>
        </Router>
    );
}

export default App;

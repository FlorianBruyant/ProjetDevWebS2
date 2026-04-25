import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { Box } from '@mui/material';
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

// --- MISE À JOUR DE LA ROUTE PROTÉGÉE ---
const RouteProtegee = ({ children, rolesAutorises = [] }) => {
    const token = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('role_token'); // On récupère le rôle

    // 1. Si pas de token, direction connexion
    if (!token || token === 'undefined') {
        return <Navigate to="/connexion" replace />;
    }

    // 2. Si des rôles spécifiques sont demandés, on vérifie
    if (rolesAutorises.length > 0 && !rolesAutorises.includes(userRole)) {
        // L'utilisateur est connecté mais n'a pas le bon rôle -> retour à la carte
        return <Navigate to="/carte" replace />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <BarreNavigation />

            <Box
                sx={{
                    pb: { xs: '80px', md: 0 },
                    pt: { xs: 0, md: '64px' },
                    minHeight: '100vh',
                }}
            >
                <Routes>
                    <Route path="/" element={<Accueil />} />
                    <Route path="/inscription" element={<Inscription />} />
                    <Route path="/connexion" element={<Connexion />} />
                    <Route
                        path="/confirmer-email/:uid/:token"
                        element={<ConfirmEmail />}
                    />
                    <Route
                        path="/mot-de-passe-oublie"
                        element={<DemandeReset />}
                    />
                    <Route
                        path="/reset-password/:uid/:token"
                        element={<NouveauMotDePasse />}
                    />

                    {/* Routes pour tous les connectés */}
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

                    {/* DASHBOARD : Uniquement ADMIN et COMPLEXE */}
                    <Route
                        path="/stats"
                        element={
                            <RouteProtegee
                                rolesAutorises={['ADMIN', 'COMPLEXE']}
                            >
                                <Dashboard />
                            </RouteProtegee>
                        }
                    />

                    <Route path="/membres" element={<Membres />} />
                    <Route path="/profil/:id" element={<ProfilMembre />} />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;

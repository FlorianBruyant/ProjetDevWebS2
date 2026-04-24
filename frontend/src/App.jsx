import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
import { Box } from '@mui/material'; // N'oublie pas d'importer Box
import Accueil from './pages/Accueil';
import PageCarte from './pages/PageCarte';
import Inscription from './pages/Inscription';
import Profil from './pages/Profil';
import Connexion from './pages/Connexion';
import BarreNavigation from './components/BarreNavigation';
import Horaires from './pages/Horaires';
import ConfirmEmail from './components/ConfirmEmail';
import DemandeReset from './pages/DemandeReset';
import NouveauMotDePasse from './components/NouveauMotDePasse';
import GestionObjet from './pages/GestionObjet';

const RouteProtegee = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token || token === 'undefined') {
        return <Navigate to="/connexion" replace />;
    }
    return children;
};

function App() {
    return (
        <Router>
            <BarreNavigation />

            {/* 👇 LE SECRET EST ICI : Un coussin d'air dynamique */}
            {/* Sur Mobile (xs): padding en bas de 80px (car la barre est en bas) */}
            {/* Sur Ordi (md): padding en haut de 64px (car la barre est en haut) */}
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
                </Routes>
            </Box>
        </Router>
    );
}

export default App;

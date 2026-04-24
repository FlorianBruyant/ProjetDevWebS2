import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from 'react-router-dom';
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

// --- LE VIDEUR (PROTECTEUR DE ROUTES) ---
// Ce composant vérifie si l'utilisateur est connecté avant d'afficher la page
const RouteProtegee = ({ children }) => {
    const token = localStorage.getItem('access_token');

    // Si le token n'existe pas ou est invalide, on le jette vers la page de connexion
    if (!token || token === 'undefined') {
        return <Navigate to="/connexion" replace />;
    }

    // S'il a le token, on le laisse passer et on affiche la page demandée (children)
    return children;
};

function App() {
    return (
        <Router>
            {/* La barre de navigation reste visible partout */}
            <BarreNavigation />

            <Routes>
                {/* 🟢 ROUTES PUBLIQUES (Accessibles à tous) */}
                <Route path="/" element={<Accueil />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/connexion" element={<Connexion />} />
                <Route
                    path="/confirmer-email/:uid/:token"
                    element={<ConfirmEmail />}
                />
                <Route path="/mot-de-passe-oublie" element={<DemandeReset />} />
                <Route
                    path="/reset-password/:uid/:token"
                    element={<NouveauMotDePasse />}
                />

                {/* 🔴 ROUTES PROTÉGÉES (Réservées aux connectés) */}
                {/* On emballe les composants dans <RouteProtegee> */}
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
        </Router>
    );
}

export default App;

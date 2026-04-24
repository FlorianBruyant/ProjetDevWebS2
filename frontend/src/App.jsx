import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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

// Import de la page de gestion des objets
import GestionObjet from './pages/GestionObjet';

function App() {
    return (
        <Router>
            {/* La barre de navigation est persistante sur toutes les pages */}
            <BarreNavigation />

            <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/carte" element={<PageCarte />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/horaires" element={<Horaires />} />
                <Route path="/inscription" element={<Inscription />} />
                <Route path="/connexion" element={<Connexion />} />

                {/* Routes de confirmation et réinitialisation */}
                <Route
                    path="/confirmer-email/:uid/:token"
                    element={<ConfirmEmail />}
                />
                <Route path="/mot-de-passe-oublie" element={<DemandeReset />} />
                <Route
                    path="/reset-password/:uid/:token"
                    element={<NouveauMotDePasse />}
                />

                {/* MISE À JOUR : La route accepte maintenant le type_api 
                  pour différencier les requêtes (feux/vehicules/parkings)
                */}
                <Route path="/objet/:type_api/:id" element={<GestionObjet />} />
            </Routes>
        </Router>
    );
}

export default App;

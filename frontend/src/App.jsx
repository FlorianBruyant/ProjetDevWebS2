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

function App() {
    return (
        <Router>
            {/* La barre est placée ici. Comme elle est en "position: fixed",
               elle restera en haut de l'écran peu importe la page affichée.
            */}
            <BarreNavigation />

            <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/carte" element={<PageCarte />} />
                <Route path="/profil" element={<Profil />} />
                <Route path="/horaires" element={<Horaires />} />
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
            </Routes>
        </Router>
    );
}

export default App;

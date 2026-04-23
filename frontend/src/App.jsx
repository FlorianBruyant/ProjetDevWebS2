import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import PageCarte from './pages/PageCarte';
import Inscription from './pages/Inscription';
import Profil from './pages/Profil'; // 1. On importe la nouvelle page
import BarreNavigation from './components/BarreNavigation';

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

                <Route path="/inscription" element={<Inscription />} />
            </Routes>
        </Router>
    );
}

export default App;

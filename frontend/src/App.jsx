import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Accueil from './pages/Accueil';
import PageCarte from './pages/PageCarte';
import BarreNavigation from './components/BarreNavigation'; // On l'importe ici

function App() {
    return (
        <Router>
            {/* Le contenu des pages */}
            <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/carte" element={<PageCarte />} />
            </Routes>

            {/* La barre s'affiche par-dessus toutes les pages */}
            <BarreNavigation />
        </Router>
    );
}

export default App;

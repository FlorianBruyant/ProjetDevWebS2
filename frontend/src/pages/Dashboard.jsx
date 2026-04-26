import React, { useEffect, useState } from 'react';
import TableauBordReporting from '../components/analytics/TableauBordReporting';

const Dashboard = () => {
    const [autorisationAccordee, setAutorisationAccordee] = useState(false);

    useEffect(() => {
        // 1. On cherche le token (on vérifie session ET local au cas où)
        const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');

        // 2. Si le token n'existe pas ou est corrompu
        if (!token || token === 'undefined') {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/'; // 🚨 Expulsion instantanée
        } else {
            // 3. Tout va bien, on donne le feu vert pour afficher le tableau
            setAutorisationAccordee(true);
        }
    }, []);

    // 🛑 TANT QUE LE FEU N'EST PAS VERT, ON AFFICHE RIEN.
    // Ça empêche TableauBordReporting de s'exécuter et de faire crasher React.
    if (!autorisationAccordee) {
        return null;
    }

    // ✅ FEU VERT : On charge les graphiques
    return <TableauBordReporting />;
};

export default Dashboard;

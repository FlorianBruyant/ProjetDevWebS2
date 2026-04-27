import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';
import {
    Box,
    Typography,
    Avatar,
    InputBase,
    Chip,
    Grid,
    IconButton,
    Paper,
    List,
    Container,
    CircularProgress,
    Alert,
} from '@mui/material';
import { Search, Traffic, LocalParking, DirectionsBus, WarningAmberRounded, ConstructionRounded } from '@mui/icons-material';
import Carte from '../components/Carte';

const Accueil = () => {
    const navigate = useNavigate();
    const [saisie, setSaisie] = useState('');
    const [donneesVille, setDonneesVille] = useState([]);
    const [profil, setProfil] = useState(null);
    const [stats, setStats] = useState({
        feuxPanne: 0,
        placesDispo: 0,
        busActifs: 0,
        alertes: [],
    });
    const [chargement, setChargement] = useState(true);
    const [filtreActif, setFiltreActif] = useState('Tout');

    const envoyerVersCarte = e => {
        if (e) e.preventDefault();
        navigate('/carte', {
            state: { focusRecherche: true, texteInitial: saisie },
        });
    };

    // --- 1. RÉCUPÉRATION DU PROFIL ---
    useEffect(() => {
        const fetchProfil = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const response = await fetch(`${API_BASE_URL}/api/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setProfil(data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement du profil:', error);
            }
        };
        fetchProfil();
    }, []);

    // --- 2. CHARGEMENT DES DONNÉES DE LA VILLE ---
    useEffect(() => {
        const fetchDonneesAccueil = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/map/global/`);
                if (response.ok) {
                    const data = await response.json();
                    setDonneesVille(data);

                    let feuxEnPanne = 0;
                    let placesDispoTotales = 0;
                    let busEnService = 0;
                    let nouvellesAlertes = [];

                    data.forEach(item => {
                        if (item.type_api === 'feux' && item.en_panne) feuxEnPanne++;
                        if (item.type_api === 'parkings')
                            placesDispoTotales += (item.places_totales || 0) - (item.places_occupees || 0);
                        if (item.type_api === 'vehicules' && item.est_actif && !item.en_panne) busEnService++;

                        if (item.en_panne) {
                            let titreAlerte = '';
                            let gravite = 'Alerte';

                            switch (item.type_api) {
                                case 'feux':
                                    titreAlerte = `Feu en panne : ${item.nom || `Feu #${item.id}`}`;
                                    gravite = 'Urgent';
                                    break;
                                case 'vehicules':
                                    titreAlerte = `Véhicule immobilisé : ${item.nom || `Bus #${item.id}`}`;
                                    gravite = 'Alerte';
                                    break;
                                case 'parkings':
                                    titreAlerte = `Parking fermé/défaut : ${item.nom || `Parking #${item.id}`}`;
                                    gravite = 'Urgent';
                                    break;
                                case 'evenements':
                                    titreAlerte = `Incident événement : ${item.nom || `Événement #${item.id}`}`;
                                    gravite = 'Urgent';
                                    break;
                                case 'lieux':
                                    titreAlerte = `Lieu d'intérêt bloqué : ${item.nom || `Lieu #${item.id}`}`;
                                    gravite = 'Alerte';
                                    break;
                                default:
                                    titreAlerte = `Anomalie équipement : ${item.nom || `#${item.id}`}`;
                                    gravite = 'Alerte';
                            }

                            nouvellesAlertes.push({
                                id: item.id,
                                titre: titreAlerte,
                                sousTitre: item.zone?.nom ? `Zone : ${item.zone.nom}` : 'Incident signalé',
                                type: gravite,
                                type_api: item.type_api,
                            });
                        }
                    });

                    setStats({
                        feuxPanne: feuxEnPanne,
                        placesDispo: placesDispoTotales,
                        busActifs: busEnService,
                        alertes: nouvellesAlertes,
                    });
                }
            } catch (error) {
                console.error('Erreur chargement Accueil:', error);
            } finally {
                setChargement(false);
            }
        };

        fetchDonneesAccueil();
        const interval = setInterval(fetchDonneesAccueil, 10000);
        return () => clearInterval(interval);
    }, []);

    const donneesFiltrees = donneesVille.filter(item => {
        if (filtreActif === 'Tout') return true;
        if (filtreActif === 'Trafic') return item.type_api === 'feux';
        if (filtreActif === 'Transports') return item.type_api === 'vehicules';
        if (filtreActif === 'Parkings') return item.type_api === 'parkings';
        return true;
    });

    // Sécurisation de l'URL de la photo (identique à ton fichier Profil)
    const photoSrc = profil?.photo_url
        ? profil.photo_url.startsWith('http')
            ? profil.photo_url
            : `${API_BASE_URL}${profil.photo_url}`
        : '';

    return (
        <Box sx={{ background: 'linear-gradient(180deg, #f3f8f6 0%, #eef3f8 100%)', minHeight: '100vh', pb: 12 }}>
            <Container maxWidth="md" disableGutters sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 4, md: 8 } }}>
                {/* HEADER */}
                <Box sx={{ pb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: '#0f766e', fontWeight: 800, letterSpacing: 1.5 }}>
                            Supervision Globale
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#16324f', mt: -0.5 }}>
                            Paris Live
                        </Typography>
                    </Box>
                    <Avatar
                        src={photoSrc}
                        sx={{
                            bgcolor: '#16324f',
                            color: '#fff',
                            width: 52,
                            height: 52,
                            boxShadow: '0 8px 16px rgba(22, 50, 79, 0.2)',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            border: '2px solid #fff',
                            fontSize: '1.5rem',
                        }}
                        onClick={() => navigate('/profil')}>
                        {/* Affiche l'initiale seulement si pas de photo_url */}
                        {!profil?.photo_url && (profil?.username?.charAt(0).toUpperCase() || 'U')}
                    </Avatar>
                </Box>

                {/* BARRE DE RECHERCHE */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        component="form"
                        onSubmit={envoyerVersCarte}
                        elevation={0}
                        sx={{
                            p: '8px 16px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '20px',
                            border: '1px solid rgba(22, 50, 79, 0.08)',
                            boxShadow: '0 10px 30px rgba(22, 50, 79, 0.05)',
                            transition: 'all 0.3s ease',
                            '&:focus-within': {
                                border: '1px solid #0f766e',
                                boxShadow: '0 10px 30px rgba(15, 118, 110, 0.15)',
                                transform: 'translateY(-2px)',
                            },
                        }}>
                        <IconButton sx={{ p: '10px', color: '#0f766e' }} onClick={envoyerVersCarte}>
                            <Search />
                        </IconButton>
                        <InputBase
                            sx={{ ml: 1, flex: 1, fontSize: '1.05rem', color: '#16324f', '&::placeholder': { color: '#64748b' } }}
                            placeholder="Rechercher un équipement, une rue..."
                            value={saisie}
                            onChange={e => setSaisie(e.target.value)}
                        />
                    </Paper>
                </Box>

                {/* APERÇU CARTE */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            height: 240,
                            bgcolor: '#e5e7eb',
                            borderRadius: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid rgba(22, 50, 79, 0.08)',
                            boxShadow: '0 20px 40px rgba(22, 50, 79, 0.08)',
                        }}>
                        <Box sx={{ height: '100%', width: '100%', opacity: 0.95 }}>
                            {chargement ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                    <CircularProgress sx={{ color: '#0f766e' }} />
                                </Box>
                            ) : (
                                <Carte donnees={donneesFiltrees} hauteur="240px" />
                            )}
                        </Box>

                        <Chip
                            label="Ouvrir la carte interactive"
                            onClick={() => navigate('/carte')}
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                bgcolor: 'rgba(255, 255, 255, 0.95)',
                                backdropFilter: 'blur(10px)',
                                color: '#16324f',
                                fontWeight: 800,
                                py: 2.5,
                                px: 1.5,
                                borderRadius: '12px',
                                boxShadow: '0 4px 12px rgba(22, 50, 79, 0.15)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#ffffff',
                                    transform: 'scale(1.03) translateY(-2px)',
                                    boxShadow: '0 8px 16px rgba(22, 50, 79, 0.2)',
                                },
                            }}
                        />
                    </Paper>
                </Box>

                {/* FILTRES DYNAMIQUES */}
                <Box
                    sx={{
                        mb: 4,
                        display: 'flex',
                        gap: 1.5,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}>
                    {['Tout', 'Trafic', 'Transports', 'Parkings'].map(filtre => (
                        <FilterChip
                            key={filtre}
                            label={filtre}
                            active={filtreActif === filtre}
                            onClick={() => setFiltreActif(filtre)}
                        />
                    ))}
                </Box>

                {/* GRILLE EVENEMENTS */}
                <Box sx={{ mb: 5 }}>
                    <Grid container spacing={2.5}>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<Traffic />}
                                title="Réseau Feux"
                                val={stats.feuxPanne > 0 ? 'Attention' : 'Optimal'}
                                sub={`${stats.feuxPanne} panne(s)`}
                                color={stats.feuxPanne > 0 ? '#b45309' : '#0f766e'}
                                bgColor={stats.feuxPanne > 0 ? '#fef3c7' : '#ccfbf1'}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<LocalParking />}
                                title="Disponibilité"
                                val={stats.placesDispo.toString()}
                                sub="Places libres"
                                color="#16324f"
                                bgColor="#e2e8f0"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<DirectionsBus />}
                                title="Transports"
                                val={stats.busActifs.toString()}
                                sub="En service"
                                color="#0f766e"
                                bgColor="#ccfbf1"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<WarningAmberRounded />}
                                title="Alertes"
                                val={stats.alertes.length.toString()}
                                sub="En cours"
                                color={stats.alertes.length > 0 ? '#dc2626' : '#64748b'}
                                bgColor={stats.alertes.length > 0 ? '#fee2e2' : '#f1f5f9'}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ALERTES EN DIRECT */}
                <Paper
                    sx={{
                        p: 3,
                        borderRadius: '24px',
                        border: '1px solid rgba(22, 50, 79, 0.08)',
                        boxShadow: '0 20px 40px rgba(22, 50, 79, 0.05)',
                        bgcolor: '#ffffff',
                    }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: '#16324f' }}>
                            Journal des Incidents
                        </Typography>
                        {stats.alertes.length > 0 && (
                            <Chip
                                label="Live"
                                color="error"
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
                            />
                        )}
                    </Box>

                    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {stats.alertes.length === 0 ? (
                            <Alert severity="success" sx={{ borderRadius: 2, '& .MuiAlert-message': { fontWeight: 600 } }}>
                                Tout est opérationnel : aucune anomalie sur le réseau.
                            </Alert>
                        ) : (
                            stats.alertes.map((alerte, index) => (
                                <Box
                                    key={index}
                                    onClick={() => navigate(`/objet/${alerte.type_api}/${alerte.id}`)}
                                    sx={{ cursor: 'pointer' }}>
                                    <AlertItem
                                        icon={alerte.type === 'Urgent' ? <WarningAmberRounded /> : <ConstructionRounded />}
                                        title={alerte.titre}
                                        date={alerte.sousTitre}
                                        status={alerte.type}
                                        color={alerte.type === 'Urgent' ? '#dc2626' : '#b45309'}
                                        bgColor={alerte.type === 'Urgent' ? '#fee2e2' : '#fef3c7'}
                                    />
                                </Box>
                            ))
                        )}
                    </List>
                </Paper>
            </Container>
        </Box>
    );
};

// --- SOUS-COMPOSANTS ---

const FilterChip = ({ label, active, onClick }) => (
    <Chip
        label={label}
        onClick={onClick}
        sx={{
            bgcolor: active ? '#16324f' : '#ffffff',
            color: active ? '#ffffff' : '#64748b',
            border: active ? '1px solid #16324f' : '1px solid rgba(22, 50, 79, 0.1)',
            fontWeight: 700,
            fontSize: '0.875rem',
            px: 1.5,
            py: 2.2,
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: active ? '0 4px 12px rgba(22, 50, 79, 0.2)' : '0 2px 6px rgba(22, 50, 79, 0.04)',
            transition: 'all 0.3s ease',
            '&:hover': {
                bgcolor: active ? '#0f243a' : '#f8fafc',
                transform: 'translateY(-2px)',
            },
        }}
    />
);

const StatusCard = ({ icon, title, val, sub, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2.5,
            borderRadius: '20px',
            border: '1px solid rgba(22, 50, 79, 0.06)',
            boxShadow: '0 10px 25px rgba(22, 50, 79, 0.04)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            bgcolor: '#ffffff',
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 15px 35px rgba(22, 50, 79, 0.08)',
                borderColor: 'rgba(22, 50, 79, 0.12)',
            },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ bgcolor: bgColor, color: color, p: 1, borderRadius: '12px', display: 'flex', mr: 1.5 }}>
                {React.cloneElement(icon, { sx: { fontSize: 22 } })}
            </Box>
            <Typography variant="body2" fontWeight="700" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {title}
            </Typography>
        </Box>
        <Typography variant="h4" fontWeight="900" sx={{ color: '#16324f', mb: 0.5, letterSpacing: '-0.5px' }}>
            {val}
        </Typography>
        <Typography variant="caption" fontWeight="700" sx={{ color: color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {sub}
        </Typography>
    </Paper>
);

const AlertItem = ({ icon, title, date, status, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderRadius: '16px',
            border: '1px solid rgba(22, 50, 79, 0.06)',
            boxShadow: '0 4px 12px rgba(22, 50, 79, 0.02)',
            borderLeft: `5px solid ${color}`,
            transition: 'all 0.2s ease',
            bgcolor: '#ffffff',
            '&:hover': {
                bgcolor: '#f8fafc',
                transform: 'translateX(4px)',
                boxShadow: '0 6px 16px rgba(22, 50, 79, 0.06)',
            },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ bgcolor: bgColor, color: color, p: 1.2, borderRadius: '12px', display: 'flex', mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="body1" fontWeight="800" sx={{ color: '#16324f', mb: 0.3 }}>
                    {title}
                </Typography>
                <Typography variant="caption" fontWeight="600" color="text.secondary">
                    {date}
                </Typography>
            </Box>
        </Box>
        <Chip
            label={status}
            size="small"
            sx={{ bgcolor: bgColor, color: color, fontWeight: 800, borderRadius: '8px', letterSpacing: '0.5px' }}
        />
    </Paper>
);

export default Accueil;

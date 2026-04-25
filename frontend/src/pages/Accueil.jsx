import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import { Search, Traffic, LocalParking, DirectionsBus, WarningAmberRounded, ConstructionRounded } from '@mui/icons-material';
import Carte from '../components/Carte';

const Accueil = () => {
    const navigate = useNavigate();
    const [saisie, setSaisie] = useState('');
    const [donneesVille, setDonneesVille] = useState([]);
    const [stats, setStats] = useState({
        feuxPanne: 0,
        placesDispo: 0,
        busActifs: 0,
        alertes: [],
    });
    const [chargement, setChargement] = useState(true);
    const [filtreActif, setFiltreActif] = useState('Tout'); // Pour les boutons "Tout", "Trafic", etc.

    const envoyerVersCarte = e => {
        if (e) e.preventDefault();
        navigate('/carte', {
            state: { focusRecherche: true, texteInitial: saisie },
        });
    };

    // --- CHARGEMENT DES VRAIES DONNÉES DE LA VILLE ---
    useEffect(() => {
        const fetchDonneesAccueil = async () => {
            try {
                // On récupère TOUTE la ville pour faire nos statistiques
                const response = await fetch('http://localhost:8000/api/map/global/');
                if (response.ok) {
                    const data = await response.json();
                    setDonneesVille(data);

                    // --- CALCUL DES STATISTIQUES EN TEMPS RÉEL ---
                    let feuxEnPanne = 0;
                    let placesDispoTotales = 0;
                    let busEnService = 0;
                    let nouvellesAlertes = [];

                    data.forEach(item => {
                        // 1. Feux en panne
                        if (item.type_api === 'feux' && item.en_panne) {
                            feuxEnPanne++;
                            nouvellesAlertes.push({
                                id: item.id,
                                titre: `Feu en panne : ${item.nom}`,
                                sousTitre: 'Intervention requise',
                                type: 'Urgent',
                                type_api: 'feux',
                            });
                        }
                        // 2. Parkings (Places disponibles)
                        if (item.type_api === 'parkings') {
                            placesDispoTotales += item.places_totales - item.places_occupees;
                        }
                        // 3. Bus en circulation (actifs et pas en panne)
                        if (item.type_api === 'vehicules' && item.est_actif && !item.en_panne) {
                            busEnService++;
                        }
                        // 4. Véhicules en panne
                        if (item.type_api === 'vehicules' && item.en_panne) {
                            nouvellesAlertes.push({
                                id: item.id,
                                titre: `Véhicule immobilisé : ${item.nom}`,
                                sousTitre: 'Trafic potentiellement ralenti',
                                type: 'Alerte',
                                type_api: 'vehicules',
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
                console.error('Erreur chargement Dashboard:', error);
            } finally {
                setChargement(false);
            }
        };

        fetchDonneesAccueil();
        const interval = setInterval(fetchDonneesAccueil, 10000); // MaJ toutes les 10s
        return () => clearInterval(interval);
    }, []);

    // --- FILTRAGE DE LA MINI-CARTE ---
    const donneesFiltrees = donneesVille.filter(item => {
        if (filtreActif === 'Tout') return true;
        if (filtreActif === 'Trafic') return item.type_api === 'feux';
        if (filtreActif === 'Transports') return item.type_api === 'vehicules';
        if (filtreActif === 'Parkings') return item.type_api === 'parkings';
        return true;
    });

    return (
        <Box sx={{ bgcolor: '#f9fafb', minHeight: '100vh', pb: 12 }}>
            <Container maxWidth="md" disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
                {/* HEADER */}
                <Box
                    sx={{
                        pt: 5,
                        pb: 3,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <Box>
                        <Typography variant="overline" color="text.secondary" fontWeight="600" letterSpacing={1.5}>
                            Tableau de bord
                        </Typography>
                        <Typography variant="h4" fontWeight="800" sx={{ color: '#111827', mt: -0.5 }}>
                            Cergy Live
                        </Typography>
                    </Box>
                    <Avatar
                        sx={{
                            bgcolor: '#2563eb',
                            color: '#fff',
                            width: 48,
                            height: 48,
                            boxShadow: '0px 4px 12px rgba(37, 99, 235, 0.3)',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate('/profil')}>
                        U
                    </Avatar>
                </Box>

                {/* BARRE DE RECHERCHE */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        component="form"
                        onSubmit={envoyerVersCarte}
                        elevation={0}
                        sx={{
                            p: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '16px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.03)',
                            transition: 'all 0.2s ease',
                            '&:focus-within': {
                                border: '1px solid #2563eb',
                                boxShadow: '0px 4px 20px rgba(37, 99, 235, 0.1)',
                            },
                        }}>
                        <IconButton sx={{ p: '10px', color: '#6b7280' }} onClick={envoyerVersCarte}>
                            <Search />
                        </IconButton>
                        <InputBase
                            sx={{
                                ml: 1,
                                flex: 1,
                                fontSize: '1rem',
                                color: '#1f2937',
                            }}
                            placeholder="Rechercher un équipement..."
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
                            height: 220,
                            bgcolor: '#e5e7eb',
                            borderRadius: '20px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid #f3f4f6',
                            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.04)',
                        }}>
                        <Box sx={{ height: '100%', width: '100%', opacity: 0.9 }}>
                            {chargement ? (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                    }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <Carte donnees={donneesFiltrees} hauteur="220px" />
                            )}
                        </Box>

                        <Chip
                            label="Ouvrir la carte complète"
                            onClick={() => navigate('/carte')}
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                right: 16,
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(8px)',
                                color: '#111827',
                                fontWeight: '700',
                                py: 2.5,
                                px: 1,
                                borderRadius: '12px',
                                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                                cursor: 'pointer',
                                transition: 'transform 0.2s ease',
                                '&:hover': {
                                    bgcolor: '#ffffff',
                                    transform: 'scale(1.05)',
                                },
                            }}
                        />
                    </Paper>
                </Box>

                {/* FILTRES DYNAMIQUES */}
                <Box
                    sx={{
                        mb: 3,
                        display: 'flex',
                        gap: 1.5,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
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

                {/* GRILLE EVENEMENTS (AVEC VRAIES DONNÉES) */}
                <Box sx={{ mb: 5 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<Traffic />}
                                title="État du Réseau"
                                val={stats.feuxPanne > 0 ? 'Attention' : 'Fluide'}
                                sub={`${stats.feuxPanne} feu(x) en panne`}
                                color={stats.feuxPanne > 0 ? '#ea580c' : '#16a34a'}
                                bgColor={stats.feuxPanne > 0 ? '#ffedd5' : '#dcfce7'}
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<LocalParking />}
                                title="Disponibilité"
                                val={stats.placesDispo.toString()}
                                sub="Places libres"
                                color="#2563eb"
                                bgColor="#dbeafe"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<DirectionsBus />}
                                title="Transports"
                                val={stats.busActifs.toString()}
                                sub="Bus en service"
                                color="#16a34a"
                                bgColor="#dcfce7"
                            />
                        </Grid>
                        <Grid item xs={6} md={3}>
                            <StatusCard
                                icon={<WarningAmberRounded />}
                                title="Alertes"
                                val={stats.alertes.length.toString()}
                                sub="En cours"
                                color={stats.alertes.length > 0 ? '#dc2626' : '#6b7280'}
                                bgColor={stats.alertes.length > 0 ? '#fee2e2' : '#f3f4f6'}
                            />
                        </Grid>
                    </Grid>
                </Box>

                {/* ALERTES EN DIRECT */}
                <Box>
                    <Typography variant="h6" fontWeight="800" sx={{ color: '#111827', mb: 2 }}>
                        Alertes en direct
                    </Typography>
                    <List
                        disablePadding
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                        }}>
                        {stats.alertes.length === 0 ? (
                            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                Aucun incident signalé sur le réseau.
                            </Typography>
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
                                        color={alerte.type === 'Urgent' ? '#dc2626' : '#ea580c'}
                                        bgColor={alerte.type === 'Urgent' ? '#fee2e2' : '#ffedd5'}
                                    />
                                </Box>
                            ))
                        )}
                    </List>
                </Box>
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
            bgcolor: active ? '#111827' : '#ffffff',
            color: active ? '#ffffff' : '#4b5563',
            border: active ? 'none' : '1px solid #e5e7eb',
            fontWeight: '600',
            fontSize: '0.875rem',
            px: 1,
            py: 2,
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { bgcolor: active ? '#1f2937' : '#f3f4f6' },
        }}
    />
);

const StatusCard = ({ icon, title, val, sub, color, bgColor }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            borderRadius: '16px',
            border: '1px solid #f3f4f6',
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.02)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.04)',
            },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <Box
                sx={{
                    bgcolor: bgColor,
                    color: color,
                    p: 0.8,
                    borderRadius: '8px',
                    display: 'flex',
                    mr: 1.5,
                }}>
                {React.cloneElement(icon, { sx: { fontSize: 20 } })}
            </Box>
            <Typography variant="body2" fontWeight="600" color="text.secondary">
                {title}
            </Typography>
        </Box>
        <Typography variant="h5" fontWeight="800" sx={{ color: '#111827', mb: 0.2 }}>
            {val}
        </Typography>
        <Typography variant="caption" fontWeight="600" sx={{ color: color }}>
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
            border: '1px solid #f3f4f6',
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.02)',
            borderLeft: `4px solid ${color}`,
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: '#f9fafb' },
        }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    bgcolor: bgColor,
                    color: color,
                    p: 1,
                    borderRadius: '10px',
                    display: 'flex',
                    mr: 2,
                }}>
                {icon}
            </Box>
            <Box>
                <Typography variant="body1" fontWeight="700" sx={{ color: '#111827' }}>
                    {title}
                </Typography>
                <Typography variant="caption" fontWeight="500" color="text.secondary">
                    {date}
                </Typography>
            </Box>
        </Box>
        <Chip
            label={status}
            size="small"
            sx={{
                bgcolor: bgColor,
                color: color,
                fontWeight: '700',
                borderRadius: '6px',
            }}
        />
    </Paper>
);

export default Accueil;

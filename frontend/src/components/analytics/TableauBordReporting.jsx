import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    List,
    Typography,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const API_BASE_URL = 'http://localhost:8000/api/map';

const FILTERS_PERIODS = [
    { value: '24', label: '24 heures' },
    { value: '72', label: '3 jours' },
    { value: '168', label: '7 jours' },
    { value: '720', label: '30 jours' },
];

const FILTERS_TYPES = [
    { value: '', label: 'Tous les objets' },
    { value: 'vehicule', label: 'Véhicules' },
    { value: 'feu', label: 'Feux' },
    { value: 'parking', label: 'Parkings' },
];

const formatNumber = value => Number(value || 0).toFixed(2);
const escapeCsv = value => `"${String(value ?? '').replaceAll('"', '""')}"`;

const TableauBordReporting = () => {
    const [zones, setZones] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        periodHours: '24',
        typeObjet: '',
        zone: '',
    });

    // 1. Chargement des Zones
    useEffect(() => {
        const fetchZones = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`${API_BASE_URL}/zones/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error('Impossible de charger les zones.');
                const json = await res.json();
                setZones(json);
            } catch (err) {
                setError(err.message);
            }
        };
        fetchZones();
    }, []);

    // 2. Chargement Mixte : Historique (Analytics) + Temps Réel (Global)
    useEffect(() => {
        const fetchAnalyticsAndRealTimeAlerts = async (isFirstLoad = true) => {
            const token = localStorage.getItem('access_token');
            const params = new URLSearchParams({ period_hours: filters.periodHours });

            if (filters.typeObjet) params.set('type_objet', filters.typeObjet);
            if (filters.zone) params.set('zone', filters.zone);

            if (isFirstLoad) setLoading(true);
            setError('');

            try {
                // A. On récupère les graphiques historiques de consommation
                const resAnalytics = await fetch(`${API_BASE_URL}/analytics/?${params.toString()}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // B. On récupère les VRAIES données de la carte comme sur l'accueil
                const resGlobal = await fetch(`${API_BASE_URL}/global/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!resAnalytics.ok || !resGlobal.ok) {
                    throw new Error('Erreur lors du chargement des statistiques.');
                }

                const jsonAnalytics = await resAnalytics.json();
                const jsonGlobal = await resGlobal.json();

                // --- CALCUL DES VRAIES ALERTES (Inspiré de l'Accueil) ---
                let alertesReelles = [];
                jsonGlobal.forEach(item => {
                    // Filtre Zone : On vérifie si l'utilisateur a sélectionné une zone précise
                    if (filters.zone && String(item.zone?.id || item.zone) !== String(filters.zone)) return;

                    // Filtre Type d'objet
                    if (filters.typeObjet === 'vehicule' && item.type_api !== 'vehicules') return;
                    if (filters.typeObjet === 'feu' && item.type_api !== 'feux') return;
                    if (filters.typeObjet === 'parking' && item.type_api !== 'parkings') return;

                    // Détection des Pannes
                    if (item.type_api === 'feux' && item.en_panne) {
                        alertesReelles.push({
                            id: item.id,
                            titre: `Feu en panne : ${item.nom || `Feu #${item.id}`}`,
                            sousTitre: item.zone?.nom ? `Zone : ${item.zone.nom}` : 'Intervention requise',
                            type: 'Urgent',
                            type_api: 'feux',
                        });
                    }
                    if (item.type_api === 'vehicules' && item.en_panne) {
                        alertesReelles.push({
                            id: item.id,
                            titre: `Véhicule immobilisé : ${item.nom || `Bus #${item.id}`}`,
                            sousTitre: item.zone?.nom ? `Zone : ${item.zone.nom}` : 'Trafic perturbé',
                            type: 'Alerte',
                            type_api: 'vehicules',
                        });
                    }
                });

                // On injecte les vraies alertes calculées dans notre objet stats
                jsonAnalytics.alertes = alertesReelles;
                jsonAnalytics.resume.alertes_actives = alertesReelles.length;

                setStats(jsonAnalytics);
            } catch (err) {
                setError(err.message);
            } finally {
                if (isFirstLoad) setLoading(false);
            }
        };

        // On lance immédiatement
        fetchAnalyticsAndRealTimeAlerts(true);

        // Boucle de rafraîchissement toutes les 15 secondes pour les pannes !
        const intervalId = setInterval(() => {
            console.log('🔄 Rafraîchissement des alertes du Dashboard...');
            fetchAnalyticsAndRealTimeAlerts(false);
        }, 15000);

        return () => clearInterval(intervalId);
    }, [filters]);

    const handleFilterChange = field => event => {
        setFilters(current => ({ ...current, [field]: event.target.value }));
    };

    const handleExport = () => {
        if (!stats) return;
        const rows = [
            ['Filtre periode', `${filters.periodHours}h`],
            ['Filtre type', filters.typeObjet || 'all'],
            ['Filtre zone', filters.zone || 'all'],
            [],
            ['Resume', 'Valeur'],
            ['Consommation totale', formatNumber(stats.resume?.consommation_totale)],
            ['Consommation moyenne', formatNumber(stats.resume?.consommation_moyenne)],
            ['Mesures', stats.resume?.mesures || 0],
            ['Alertes actives', stats.resume?.alertes_actives || 0],
            [],
            ['Type objet', 'Total kWh', 'Moyenne kWh', 'Mesures'],
            ...(stats.par_type || []).map(item => [
                item.type_objet,
                formatNumber(item.total),
                formatNumber(item.moyenne),
                item.mesures,
            ]),
        ];
        const csvContent = rows.map(row => row.map(cell => escapeCsv(cell)).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporting-iot-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    if (loading && !stats) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
                <CircularProgress size={56} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                px: { xs: 2, md: 4 },
                py: { xs: 3, md: 4 },
                mt: 8,
                background: 'linear-gradient(180deg, #f3f8f6 0%, #eef3f8 100%)',
            }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#16324f', mb: 1 }}>
                    Monitoring & Reporting IoT
                </Typography>
                <Typography variant="body1" sx={{ color: '#526173', mb: 4, maxWidth: 860 }}>
                    Vue opérationnelle des consommations et état en direct du réseau selon la zone ciblée.
                </Typography>

                {error && (
                    <Alert severity="error" variant="filled" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Paper
                    sx={{
                        p: 2,
                        mb: 3,
                        borderRadius: 2,
                        border: '1px solid rgba(22, 50, 79, 0.08)',
                        boxShadow: '0 20px 45px rgba(22, 50, 79, 0.08)',
                    }}>
                    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 180 }}>
                            <FilterAltRoundedIcon sx={{ color: '#0f766e' }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#16324f' }}>
                                Filtres avancés
                            </Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Période Conso</InputLabel>
                                <Select
                                    value={filters.periodHours}
                                    label="Période Conso"
                                    onChange={handleFilterChange('periodHours')}>
                                    {FILTERS_PERIODS.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Type d'objet</InputLabel>
                                <Select value={filters.typeObjet} label="Type d'objet" onChange={handleFilterChange('typeObjet')}>
                                    {FILTERS_TYPES.map(option => (
                                        <MenuItem key={option.value || 'all'} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Zone</InputLabel>
                                <Select value={filters.zone} label="Zone" onChange={handleFilterChange('zone')}>
                                    <MenuItem value="">Toutes les zones</MenuItem>
                                    {zones.map(zone => (
                                        <MenuItem key={zone.id} value={String(zone.id)}>
                                            {zone.nom}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                        <Button
                            variant="contained"
                            startIcon={<DownloadRoundedIcon />}
                            onClick={handleExport}
                            sx={{
                                minWidth: 220,
                                height: 40,
                                borderRadius: 2,
                                backgroundColor: '#16324f',
                                '&:hover': { backgroundColor: '#0f243a' },
                            }}>
                            Exporter les stats
                        </Button>
                    </Stack>
                </Paper>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ mb: 3 }}>
                            <Card sx={{ flex: 1, borderRadius: 2, bgcolor: '#16324f', color: '#fff' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <BoltRoundedIcon />
                                        <Typography variant="subtitle1">Consommation totale</Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                        {formatNumber(stats?.resume?.consommation_totale)} kWh
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, borderRadius: 2, bgcolor: '#0f766e', color: '#fff' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <TimelineRoundedIcon />
                                        <Typography variant="subtitle1">Mesures analysées</Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                        {stats?.resume?.mesures || 0}
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card
                                sx={{
                                    flex: 1,
                                    borderRadius: 2,
                                    bgcolor: stats?.resume?.alertes_actives > 0 ? '#b45309' : '#16a34a',
                                    color: '#fff',
                                }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <WarningAmberRoundedIcon />
                                        <Typography variant="subtitle1">Pannes Actives</Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                        {stats?.resume?.alertes_actives || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Stack>

                        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={3} sx={{ mb: 3 }}>
                            <Paper sx={{ flex: 2, p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f', mb: 2 }}>
                                    Évolution de la consommation
                                </Typography>
                                <Box sx={{ height: 340 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.graphique || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="periode" />
                                            <YAxis />
                                            <Tooltip />
                                            <Line
                                                type="monotone"
                                                dataKey="conso"
                                                stroke="#0f766e"
                                                strokeWidth={3}
                                                dot={{ r: 3 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                            <Paper sx={{ flex: 1, p: 3, borderRadius: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f', mb: 2 }}>
                                    Répartition par type
                                </Typography>
                                <Box sx={{ height: 340 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.par_type || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="type_objet" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="total" fill="#16324f" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </Paper>
                        </Stack>

                        {/* --- NOUVELLE SECTION DES ALERTES (Design inspiré de l'Accueil) --- */}
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f' }}>
                                    Alertes en direct (Vraies Données)
                                </Typography>
                                {stats?.alertes?.length > 0 && (
                                    <Chip
                                        label="Live"
                                        color="error"
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold', animation: 'pulse 2s infinite' }}
                                    />
                                )}
                            </Stack>

                            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {stats?.alertes?.length === 0 ? (
                                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                                        Tout est opérationnel : aucune panne détectée sur ce périmètre.
                                    </Alert>
                                ) : (
                                    stats.alertes.map((alerte, index) => (
                                        <Box key={index}>
                                            <AlertItem
                                                icon={
                                                    alerte.type === 'Urgent' ? (
                                                        <WarningAmberRoundedIcon />
                                                    ) : (
                                                        <ConstructionRoundedIcon />
                                                    )
                                                }
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
                        </Paper>
                    </>
                )}
            </Box>
        </Box>
    );
};

// Composant Visuel AlertItem récupéré de ton Accueil.jsx
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
            <Box sx={{ bgcolor: bgColor, color: color, p: 1, borderRadius: '10px', display: 'flex', mr: 2 }}>{icon}</Box>
            <Box>
                <Typography variant="body1" fontWeight="700" sx={{ color: '#111827' }}>
                    {title}
                </Typography>
                <Typography variant="caption" fontWeight="500" color="text.secondary">
                    {date}
                </Typography>
            </Box>
        </Box>
        <Chip label={status} size="small" sx={{ bgcolor: bgColor, color: color, fontWeight: '700', borderRadius: '6px' }} />
    </Paper>
);

export default TableauBordReporting;

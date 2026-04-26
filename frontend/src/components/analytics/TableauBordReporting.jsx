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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
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
    { value: 'vehicule', label: 'Vehicules' },
    { value: 'feu', label: 'Feux' },
    { value: 'parking', label: 'Parkings' },
    { value: 'lieu', label: "Lieux d'interet" },
    { value: 'evenement', label: 'Evenements' },
];

const formatNumber = (value) => Number(value || 0).toFixed(2);

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

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

    useEffect(() => {
        const fetchZones = async () => {
            const token = localStorage.getItem('access_token');

            try {
                const res = await fetch(`${API_BASE_URL}/zones/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Impossible de charger les zones.');
                }

                const json = await res.json();
                setZones(json);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchZones();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            const token = localStorage.getItem('access_token');
            const params = new URLSearchParams({
                period_hours: filters.periodHours,
            });

            if (filters.typeObjet) {
                params.set('type_objet', filters.typeObjet);
            }
            if (filters.zone) {
                params.set('zone', filters.zone);
            }

            setLoading(true);
            setError('');

            try {
                const res = await fetch(`${API_BASE_URL}/analytics/?${params.toString()}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.status === 403) {
                    throw new Error("Acces refuse : vous n'avez pas les permissions necessaires.");
                }

                if (!res.ok) {
                    throw new Error('Impossible de charger les statistiques de reporting.');
                }

                const json = await res.json();
                setStats(json);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [filters]);

    const handleFilterChange = (field) => (event) => {
        setFilters((current) => ({
            ...current,
            [field]: event.target.value,
        }));
    };

    const handleExport = () => {
        if (!stats) {
            return;
        }

        // Export simple CSV pour reutiliser directement les chiffres du dashboard.
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
            ...(stats.par_type || []).map((item) => [
                item.type_objet,
                formatNumber(item.total),
                formatNumber(item.moyenne),
                item.mesures,
            ]),
        ];

        const csvContent = rows
            .map((row) => row.map((cell) => escapeCsv(cell)).join(','))
            .join('\n');

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
                    Vue operationnelle des consommations, alertes et tendances d&apos;usage avec filtres par
                    periode, typologie d&apos;objet et zone.
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
                                Filtres avances
                            </Typography>
                        </Stack>

                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1 }}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="period-label">Periode</InputLabel>
                                <Select
                                    labelId="period-label"
                                    value={filters.periodHours}
                                    label="Periode"
                                    onChange={handleFilterChange('periodHours')}>
                                    {FILTERS_PERIODS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel id="type-label">Type d&apos;objet</InputLabel>
                                <Select
                                    labelId="type-label"
                                    value={filters.typeObjet}
                                    label="Type d'objet"
                                    onChange={handleFilterChange('typeObjet')}>
                                    {FILTERS_TYPES.map((option) => (
                                        <MenuItem key={option.value || 'all'} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="small">
                                <InputLabel id="zone-label">Zone</InputLabel>
                                <Select
                                    labelId="zone-label"
                                    value={filters.zone}
                                    label="Zone"
                                    onChange={handleFilterChange('zone')}>
                                    <MenuItem value="">Toutes les zones</MenuItem>
                                    {zones.map((zone) => (
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
                                        <Typography variant="subtitle1">Mesures analysees</Typography>
                                    </Stack>
                                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                                        {stats?.resume?.mesures || 0}
                                    </Typography>
                                </CardContent>
                            </Card>

                            <Card sx={{ flex: 1, borderRadius: 2, bgcolor: '#b45309', color: '#fff' }}>
                                <CardContent>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                        <WarningAmberRoundedIcon />
                                        <Typography variant="subtitle1">Alertes actives</Typography>
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
                                    Evolution de la consommation
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
                                    Repartition par type
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

                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#16324f', mb: 2 }}>
                                Dernieres alertes
                            </Typography>

                            {stats?.alertes?.length ? (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Objet</TableCell>
                                                <TableCell>Zone</TableCell>
                                                <TableCell>Niveau</TableCell>
                                                <TableCell>Statut</TableCell>
                                                <TableCell>Message</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {stats.alertes.map((alerte) => (
                                                <TableRow key={alerte.id} hover>
                                                    <TableCell>{`${alerte.type_objet} #${alerte.objet_id}`}</TableCell>
                                                    <TableCell>{alerte.zone__nom || 'Non renseignee'}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            size="small"
                                                            label={alerte.niveau}
                                                            color={alerte.niveau === 'critical' ? 'error' : 'warning'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{alerte.statut}</TableCell>
                                                    <TableCell>{alerte.message}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="success">Aucune alerte sur le perimetre selectionne.</Alert>
                            )}
                        </Paper>
                    </>
                )}
            </Box>
        </Box>
    );
};

export default TableauBordReporting;

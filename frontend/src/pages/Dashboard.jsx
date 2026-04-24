import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CircularProgress,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { Warning, Bolt, PrecisionManufacturing } from '@mui/icons-material';

const Dashboard = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/map/analytics/')
            .then((res) => res.json())
            .then((json) => setData(json));
    }, []);

    if (!data) return <CircularProgress />;

    return (
        <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
                Surveillance Urbaine
            </Typography>

            <Grid container spacing={3}>
                {/* Cartes de résumé */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ bgcolor: '#1a237e', color: 'white' }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}
                            >
                                <Bolt sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Consommation Totale
                                </Typography>
                            </Box>
                            <Typography variant="h3">
                                {data.par_type
                                    .reduce((acc, curr) => acc + curr.total, 0)
                                    .toFixed(2)}{' '}
                                kWh
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card
                        sx={{
                            bgcolor:
                                data.alertes.length > 0 ? '#d32f2f' : '#2e7d32',
                            color: 'white',
                        }}
                    >
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}
                            >
                                <Warning sx={{ mr: 1 }} />
                                <Typography variant="h6">
                                    Alertes Maintenance
                                </Typography>
                            </Box>
                            <Typography variant="h3">
                                {data.alertes.length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Graphique d'évolution */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Évolution de la consommation (24h)
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.graphique}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="heure" />
                                <YAxis />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="conso"
                                    stroke="#1a237e"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Comparaison par type */}
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, height: 400 }}>
                        <Typography variant="h6" gutterBottom>
                            Répartition par type
                        </Typography>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.par_type}>
                                <XAxis dataKey="type_objet" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                    dataKey="total"
                                    fill="#3f51b5"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Box, Grid, Paper, Typography, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Warning, Bolt } from '@mui/icons-material';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            const token = localStorage.getItem('access_token');

            try {
                const res = await fetch('http://localhost:8000/api/map/analytics/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (res.status === 403) {
                    throw new Error("Accès refusé : Vous n'avez pas les permissions nécessaires.");
                }

                if (!res.ok) {
                    throw new Error('Erreur lors de la récupération des données statistiques.');
                }

                const json = await res.json();
                setData(json);
            } catch (err) {
                setErreur(err.message);
                console.error('Erreur Dashboard:', err);
            } finally {
                setChargement(false);
            }
        };

        fetchStats();
    }, []);

    if (chargement)
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                }}>
                <CircularProgress size={60} />
            </Box>
        );

    if (erreur)
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error" variant="filled">
                    {erreur}
                </Alert>
            </Box>
        );

    // Calcul du total en sécurité (évite crash si data.par_type est vide)
    const consommationTotale = data?.par_type?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;

    return (
        <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh', mt: 8 }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: '900', color: '#1a237e' }}>
                Tableau de Bord Stratégique
            </Typography>

            <Grid container spacing={3}>
                {/* Cartes de résumé */}
                <Grid item xs={12} md={6} lg={4}>
                    <Card
                        sx={{
                            bgcolor: '#1a237e',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: 4,
                        }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}>
                                <Bolt sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                    Consommation Totale
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold">
                                {consommationTotale.toFixed(2)} <span style={{ fontSize: '1.5rem' }}>kWh</span>
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6} lg={4}>
                    <Card
                        sx={{
                            bgcolor: data?.alertes?.length > 0 ? '#d32f2f' : '#2e7d32',
                            color: 'white',
                            borderRadius: 3,
                            boxShadow: 4,
                        }}>
                        <CardContent>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    mb: 1,
                                }}>
                                <Warning sx={{ mr: 1 }} />
                                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                    Alertes Maintenance
                                </Typography>
                            </Box>
                            <Typography variant="h3" fontWeight="bold">
                                {data?.alertes?.length || 0}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Graphique d'évolution */}
                <Grid item xs={12} md={8}>
                    <Paper
                        sx={{
                            p: 3,
                            height: 450,
                            borderRadius: 3,
                            boxShadow: 2,
                        }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary">
                            Charge du réseau (Dernières 24h)
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart data={data?.graphique}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="heure" />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '10px',
                                        border: 'none',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="conso"
                                    stroke="#1a237e"
                                    strokeWidth={4}
                                    dot={{ r: 4, fill: '#1a237e' }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Comparaison par type */}
                <Grid item xs={12} md={4}>
                    <Paper
                        sx={{
                            p: 3,
                            height: 450,
                            borderRadius: 3,
                            boxShadow: 2,
                        }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" color="text.secondary">
                            Répartition Énergétique
                        </Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={data?.par_type}>
                                <XAxis dataKey="type_objet" tick={{ fontSize: 12 }} />
                                <YAxis />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="total" fill="#3f51b5" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;

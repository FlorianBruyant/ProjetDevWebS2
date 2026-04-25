import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Stack,
    Button,
} from '@mui/material';
import { AccessTime, Train, LocationOn, Refresh } from '@mui/icons-material';

// ID UNIQUE : Châtelet Les Halles
const ID_CHATELET = 'STIF:StopPoint:Q:474151:';

const Horaires = () => {
    const [passages, setPassages] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [derniereMaj, setDerniereMaj] = useState(new Date());

    const fetchHoraires = async () => {
        setChargement(true);
        try {
            // 👇 CORRECTION : URL mise à jour pour correspondre au nouveau Backend
            const response = await fetch(`http://localhost:8000/api/map/horaires/?gare=${ID_CHATELET}`);

            if (!response.ok) throw new Error('Erreur de connexion aux serveurs IDFM');

            const data = await response.json();
            const list = data.Siri?.ServiceDelivery?.StopMonitoringDelivery?.[0]?.MonitoredStopVisit || [];
            setPassages(list);
            setDerniereMaj(new Date());
        } catch (error) {
            console.error('Erreur API Horaires:', error);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        fetchHoraires();
        const timer = setInterval(fetchHoraires, 20000); // MaJ toutes les 20 secondes
        return () => clearInterval(timer);
    }, []);

    return (
        <Box sx={{ p: 4, bgcolor: '#f8f9fa', minHeight: '100vh', mt: 8, pb: 12 }}>
            <Paper
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1a237e 30%, #283593 90%)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(26, 35, 126, 0.2)',
                }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: '900',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}>
                            <Train fontSize="large" /> Châtelet Les Halles
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            sx={{
                                opacity: 0.8,
                                mt: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                            }}>
                            <LocationOn fontSize="small" /> Hub de transport en temps réel (RER A, B, D)
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.8, mb: 1 }}>
                            Actualisé à : {derniereMaj.toLocaleTimeString()}
                        </Typography>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={fetchHoraires}
                            disabled={chargement}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                            }}>
                            {chargement ? 'Mise à jour...' : 'Actualiser'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <TableContainer component={Paper} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: '#f1f3f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ligne</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Destination</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Horaire</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>État</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chargement && passages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                    <CircularProgress size={30} />
                                    <Typography sx={{ mt: 2 }} color="text.secondary">
                                        Connexion aux serveurs PRIM...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : passages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 10 }}>
                                    <Typography color="text.secondary">Aucun train détecté pour le moment.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            passages.map((p, index) => {
                                const info = p.MonitoredVehicleJourney;
                                const call = info?.MonitoredCall;
                                if (!info || !call) return null;

                                const dateBrute = call.ExpectedArrivalTime || call.AimedArrivalTime;
                                const heureObj = dateBrute ? new Date(dateBrute) : null;
                                const estTempsReel = !!call.ExpectedArrivalTime;

                                return (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Chip
                                                label={info.PublishedLineName?.[0]?.value ?? '?'}
                                                sx={{
                                                    fontWeight: 'bold',
                                                    bgcolor: '#1a237e',
                                                    color: 'white',
                                                    width: 55,
                                                    borderRadius: 1,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                fontWeight: '700',
                                                color: '#2c3e50',
                                            }}>
                                            {info.DestinationName?.[0]?.value ?? 'Direction Inconnue'}
                                        </TableCell>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <AccessTime fontSize="small" color={estTempsReel ? 'success' : 'action'} />
                                                <Typography
                                                    sx={{
                                                        fontWeight: 'bold',
                                                        color: estTempsReel ? '#2e7d32' : 'text.primary',
                                                    }}>
                                                    {heureObj
                                                        ? heureObj.toLocaleTimeString([], {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          })
                                                        : '--:--'}
                                                </Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    call.ArrivalStatus === 'onTime' ? "À l'heure" : call.ArrivalStatus || 'Normal'
                                                }
                                                size="small"
                                                color={call.ArrivalStatus === 'delayed' ? 'error' : 'success'}
                                                variant="outlined"
                                                sx={{ fontWeight: '600' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Horaires;

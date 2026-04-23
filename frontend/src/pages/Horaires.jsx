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
} from '@mui/material';
import { AccessTime, DirectionsBus, Train } from '@mui/icons-material';

const Horaires = () => {
    const [passages, setPassages] = useState([]);
    const [chargement, setChargement] = useState(true);

    const fetchHoraires = async () => {
        try {
            const response = await fetch(
                'http://localhost:8000/api-map/horaires/',
            );
            const data = await response.json();

            // On descend dans l'arborescence complexe de l'API PRIM (SIRI Lite)
            const list =
                data.Siri?.ServiceDelivery?.StopMonitoringDelivery[0]
                    ?.MonitoredStopVisit || [];
            setPassages(list);
        } catch (error) {
            console.error('Erreur horaires:', error);
        } finally {
            setChargement(false);
        }
    };

    useEffect(() => {
        fetchHoraires();
        const timer = setInterval(fetchHoraires, 30000); // MaJ toutes les 30 sec
        return () => clearInterval(timer);
    }, []);

    return (
        <Box sx={{ p: 4, bgcolor: '#f5f5f5', minHeight: '100vh', mt: 8 }}>
            <Typography
                variant="h4"
                sx={{ mb: 3, fontWeight: 'bold', color: '#1a237e' }}
            >
                🚉 Prochains Passages - Cergy Préfecture
            </Typography>

            <TableContainer
                component={Paper}
                sx={{ borderRadius: 3, boxShadow: 3 }}
            >
                <Table>
                    <TableHead sx={{ bgcolor: '#1a237e' }}>
                        <TableRow>
                            <TableCell
                                sx={{ color: 'white', fontWeight: 'bold' }}
                            >
                                Ligne
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', fontWeight: 'bold' }}
                            >
                                Destination
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', fontWeight: 'bold' }}
                            >
                                Heure prévue
                            </TableCell>
                            <TableCell
                                sx={{ color: 'white', fontWeight: 'bold' }}
                            >
                                État
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {chargement ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : passages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    <Typography
                                        sx={{ py: 3, color: 'text.secondary' }}
                                    >
                                        Aucun passage prévu pour le moment.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            // 🚨 VERIFIE BIEN CETTE LIGNE : Une seule accolade '{' au début !
                            passages.map((p, index) => {
                                const info = p.MonitoredVehicleJourney;
                                if (!info) return null;

                                const dateBrute =
                                    info.MonitoredCall?.ExpectedArrivalTime ||
                                    info.MonitoredCall?.AimedArrivalTime;
                                const heure = dateBrute
                                    ? new Date(dateBrute)
                                    : null;

                                return (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Chip
                                                icon={
                                                    info.VehicleMode ===
                                                    'bus' ? (
                                                        <DirectionsBus />
                                                    ) : (
                                                        <Train />
                                                    )
                                                }
                                                label={
                                                    info.PublishedLineName?.[0]
                                                        ?.value ?? '?'
                                                }
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: '500' }}>
                                            {info.DestinationName?.[0]?.value ??
                                                'Direction inconnue'}
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                }}
                                            >
                                                <AccessTime
                                                    fontSize="small"
                                                    color="action"
                                                />
                                                {heure
                                                    ? heure.toLocaleTimeString(
                                                          [],
                                                          {
                                                              hour: '2-digit',
                                                              minute: '2-digit',
                                                          },
                                                      )
                                                    : '--:--'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={
                                                    info.MonitoredCall
                                                        ?.ArrivalStatus ||
                                                    "À l'heure"
                                                }
                                                color={
                                                    info.MonitoredCall
                                                        ?.ArrivalStatus ===
                                                    'delayed'
                                                        ? 'error'
                                                        : 'success'
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            }) // 🚨 Fin du .map
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Horaires;

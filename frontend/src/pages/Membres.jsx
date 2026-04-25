import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Card,
    CardContent,
    Typography,
    Avatar,
    Button,
    Box,
    TextField,
    CircularProgress,
    InputAdornment,
    Chip,
    Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import { useNavigate } from 'react-router-dom';

export default function Membres() {
    const [membres, setMembres] = useState([]);
    const [recherche, setRecherche] = useState('');
    const [chargement, setChargement] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMembres = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await fetch('http://localhost:8000/api/members/', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setMembres(data);
                }
            } catch (err) {
                console.error('Erreur chargement membres', err);
            } finally {
                setChargement(false);
            }
        };
        fetchMembres();
    }, []);

    const membresFiltrés = membres.filter(m => m.username.toLowerCase().includes(recherche.toLowerCase()));

    if (chargement)
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '80vh',
                }}>
                <CircularProgress color="primary" />
            </Box>
        );

    return (
        <Container maxWidth="lg" sx={{ mt: 6, mb: 10 }}>
            {/* --- EN-TÊTE --- */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight="800" sx={{ color: 'white', mb: 1, letterSpacing: '-1px' }}>
                    Communauté{' '}
                    <Box component="span" sx={{ color: '#3f51b5' }}>
                        Smart City
                    </Box>
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Retrouvez les {membres.length} membres de la plateforme
                </Typography>
            </Box>

            {/* --- BARRE DE RECHERCHE (Calée sur la grille) --- */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
                <TextField
                    fullWidth
                    placeholder="Rechercher un membre par son nom..."
                    variant="outlined"
                    onChange={e => setRecherche(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: '#3f51b5' }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        maxWidth: '100%', // S'adapte au Container
                        bgcolor: 'white',
                        borderRadius: '15px',
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none',
                        },
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                />
            </Box>

            {/* --- GRILLE DES MEMBRES --- */}
            <Grid container spacing={3} alignItems="stretch">
                {membresFiltrés.map(membre => (
                    <Grid item xs={12} sm={6} md={4} key={membre.id} sx={{ display: 'flex' }}>
                        <Card
                            sx={{
                                width: '100%',
                                borderRadius: '20px',
                                display: 'flex',
                                flexDirection: 'column',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f0f2f5 100%)',
                                border: '1px solid rgba(255,255,255,0.3)',
                                transition: 'all 0.3s ease-in-out',
                                position: 'relative',
                                overflow: 'visible', // Pour laisser l'avatar dépasser si besoin
                                '&:hover': {
                                    transform: 'translateY(-10px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                },
                            }}>
                            <CardContent
                                sx={{
                                    flexGrow: 1,
                                    pt: 4,
                                    px: 3,
                                    textAlign: 'center',
                                }}>
                                {/* Avatar avec cercle de décoration */}
                                <Box
                                    sx={{
                                        position: 'relative',
                                        display: 'inline-block',
                                        mb: 2,
                                    }}>
                                    <Avatar
                                        sx={{
                                            width: 80,
                                            height: 80,
                                            mx: 'auto',
                                            bgcolor: '#3f51b5',
                                            fontSize: '2rem',
                                            fontWeight: 'bold',
                                            boxShadow: '0 8px 16px rgba(63, 81, 181, 0.3)',
                                            border: '4px solid white',
                                        }}>
                                        {membre.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </Box>

                                <Typography variant="h6" fontWeight="800" sx={{ color: '#1a1a1a', mb: 0.5 }}>
                                    {membre.username}
                                </Typography>

                                <Chip
                                    label={membre.role || 'Membre'}
                                    size="small"
                                    sx={{
                                        mb: 2,
                                        bgcolor: membre.role === 'ADMIN' ? '#ff9800' : '#e3f2fd',
                                        color: membre.role === 'ADMIN' ? 'white' : '#1976d2',
                                        fontWeight: 'bold',
                                        fontSize: '0.7rem',
                                    }}
                                />

                                <Divider sx={{ my: 2, opacity: 0.1 }} />

                                <Box
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-around',
                                        alignItems: 'center',
                                    }}>
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Niveau
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight="700"
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                            }}>
                                            <StarIcon
                                                sx={{
                                                    fontSize: 16,
                                                    color: '#fbc02d',
                                                }}
                                            />
                                            {membre.niveau || '1'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            Type
                                        </Typography>
                                        <Typography variant="body2" fontWeight="700">
                                            {membre.type_membre || 'Citoyen'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>

                            <Box sx={{ p: 3, pt: 0 }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    startIcon={<PersonIcon />}
                                    sx={{
                                        borderRadius: '12px',
                                        py: 1.2,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        bgcolor: '#3f51b5',
                                        '&:hover': { bgcolor: '#283593' },
                                        boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
                                    }}
                                    onClick={() => navigate(`/profil/${membre.id}`)}>
                                    Consulter le profil
                                </Button>
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* --- ETAT VIDE --- */}
            {membresFiltrés.length === 0 && (
                <Box sx={{ textAlign: 'center', mt: 10 }}>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                        Aucun citoyen ne correspond à votre recherche...
                    </Typography>
                </Box>
            )}
        </Container>
    );
}

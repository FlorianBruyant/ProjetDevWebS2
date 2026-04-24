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
} from '@mui/material';
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
                const response = await fetch(
                    'http://localhost:8000/api/members/',
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
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

    // Filtrer la liste en fonction de la recherche
    const membresFiltrés = membres.filter((m) =>
        m.username.toLowerCase().includes(recherche.toLowerCase()),
    );

    if (chargement)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 10 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Communauté Smart City
            </Typography>

            <TextField
                fullWidth
                label="Rechercher un membre..."
                variant="outlined"
                sx={{ mb: 4, bgcolor: 'white' }}
                onChange={(e) => setRecherche(e.target.value)}
            />

            <Grid container spacing={3}>
                {membresFiltrés.map((membre) => (
                    <Grid item xs={12} sm={6} md={4} key={membre.id}>
                        <Card
                            sx={{
                                borderRadius: 3,
                                textAlign: 'center',
                                p: 2,
                                boxShadow: 2,
                            }}
                        >
                            <CardContent>
                                <Avatar
                                    sx={{
                                        width: 60,
                                        height: 60,
                                        mx: 'auto',
                                        mb: 2,
                                        bgcolor: '#3f51b5',
                                    }}
                                >
                                    {membre.username.charAt(0).toUpperCase()}
                                </Avatar>
                                <Typography variant="h6" fontWeight="bold">
                                    {membre.username}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Niveau {membre.niveau || '1'} •{' '}
                                    {membre.type_membre}
                                </Typography>

                                <Button
                                    variant="outlined"
                                    fullWidth
                                    sx={{ mt: 2, borderRadius: 2 }}
                                    onClick={() =>
                                        navigate(`/profil/${membre.id}`)
                                    }
                                >
                                    Voir le profil
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {membresFiltrés.length === 0 && (
                <Typography sx={{ textAlign: 'center', mt: 4, color: 'gray' }}>
                    Aucun membre trouvé.
                </Typography>
            )}
        </Container>
    );
}

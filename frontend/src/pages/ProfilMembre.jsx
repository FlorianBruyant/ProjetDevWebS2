import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Container,
    CircularProgress,
    LinearProgress,
    Button,
} from '@mui/material';

export default function ProfilMembre() {
    const { id } = useParams(); // Récupère l'ID depuis l'URL
    const navigate = useNavigate();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const response = await fetch(
                    `http://localhost:8000/api/members/${id}/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    },
                );
                if (response.ok) {
                    const data = await response.json();
                    setMember(data);
                } else {
                    console.error('Membre introuvable');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMember();
    }, [id]);

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    if (!member)
        return (
            <Typography sx={{ mt: 10, textAlign: 'center' }}>
                Utilisateur introuvable.
            </Typography>
        );

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pb: 10 }}>
            <Box
                sx={{
                    height: '120px',
                    background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            />
            <Container maxWidth="sm" sx={{ mt: -6 }}>
                <Button
                    onClick={() => navigate(-1)}
                    sx={{ color: 'white', mb: 2 }}
                >
                    ← Retour
                </Button>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                            bgcolor: '#764ba2',
                            fontSize: '2.5rem',
                            mb: 2,
                        }}
                    >
                        {member.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                        {member.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Membre de la communauté
                    </Typography>
                </Box>

                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                        Niveau {member.niveau || 'Débutant'}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={40}
                        sx={{ height: 10, borderRadius: 5, my: 1 }}
                    />
                    <Typography variant="body2">
                        Points d'expérience : {member.points || 0} XP
                    </Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Informations
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Genre :</strong>{' '}
                        {member.genre || 'Non renseigné'}
                    </Typography>
                    <Typography>
                        <strong>Type de membre :</strong>{' '}
                        {member.type_membre || 'Citoyen'}
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

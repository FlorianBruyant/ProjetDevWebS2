import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../api';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    Container,
    CircularProgress,
    TextField,
    MenuItem,
    Alert,
    LinearProgress,
    Button,
} from '@mui/material';

export default function ProfilMembre() {
    const { id } = useParams(); // Récupère l'ID depuis l'URL
    const navigate = useNavigate();

    const [member, setMember] = useState(null);
    const [currentUser, setCurrentUser] = useState(null); // Pour vérifier si JE suis admin
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            try {
                // 1. Récupérer le profil consulté
                const resMember = await fetch(`${API_BASE_URL}/api/members/${id}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // 2. Récupérer mon propre profil pour vérifier mon rôle
                const resMe = await fetch(`${API_BASE_URL}/api/me/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (resMember.ok && resMe.ok) {
                    setMember(await resMember.json());
                    setCurrentUser(await resMe.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAdminUpdate = async (field, value) => {
        setIsUpdating(true);
        const token = localStorage.getItem('access_token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/members/${id}/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ [field]: value }),
            });

            if (response.ok) {
                const updatedMember = await response.json();
                setMember(updatedMember);
            } else {
                setErrorMsg("Erreur lors de la mise à jour par l'admin.");
            }
        } catch (err) {
            setErrorMsg('Erreur de connexion.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading)
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    if (!member) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Membre introuvable.</Typography>;

    const isAdmin = currentUser?.role === 'ADMIN';

    return (
        <Box sx={{ bgcolor: '#FAFAFA', minHeight: '100vh', pb: 10 }}>
            <Box
                sx={{
                    height: '120px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            />

            <Container maxWidth="sm" sx={{ mt: -6 }}>
                <Button onClick={() => navigate(-1)} sx={{ color: 'white', mb: 2 }}>
                    ← Retour
                </Button>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            border: '4px solid white',
                            bgcolor: '#764ba2',
                            fontSize: '2.5rem',
                            mb: 2,
                        }}>
                        {member.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight="bold">
                        {member.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {member.role}
                    </Typography>
                </Box>

                {errorMsg && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                )}

                {/* --- ZONE ADMIN --- */}
                {isAdmin && (
                    <Paper
                        elevation={4}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            border: '2px solid #ed6c02',
                        }}>
                        <Typography variant="subtitle1" fontWeight="bold" color="warning.main" gutterBottom>
                            Panel Administrateur
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                            <TextField
                                select
                                label="Changer le Rôle"
                                fullWidth
                                value={member.role}
                                onChange={e => handleAdminUpdate('role', e.target.value)}
                                disabled={isUpdating}>
                                <MenuItem value="VISITEUR">Visiteur</MenuItem>
                                <MenuItem value="SIMPLE">Simple</MenuItem>
                                <MenuItem value="COMPLEXE">Complexe</MenuItem>
                                <MenuItem value="ADMIN">Administrateur</MenuItem>
                            </TextField>

                            <TextField
                                select
                                label="Changer le Niveau"
                                fullWidth
                                value={member.niveau}
                                onChange={e => handleAdminUpdate('niveau', e.target.value)}
                                disabled={isUpdating}>
                                <MenuItem value="DEBUTANT">Débutant</MenuItem>
                                <MenuItem value="INTERMEDIAIRE">Intermédiaire</MenuItem>
                                <MenuItem value="AVANCE">Avancé</MenuItem>
                                <MenuItem value="EXPERT">Expert</MenuItem>
                            </TextField>
                        </Box>
                    </Paper>
                )}

                {/* --- INFORMATIONS CLASSIQUES --- */}
                <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                        Niveau {member.niveau}
                    </Typography>
                    <Typography variant="body2">Points d'expérience : {member.points || 0} XP</Typography>
                </Paper>

                <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                        Informations
                    </Typography>
                    <Typography sx={{ mb: 1 }}>
                        <strong>Genre :</strong> {member.genre}
                    </Typography>
                    <Typography>
                        <strong>Type :</strong> {member.type_membre}
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}

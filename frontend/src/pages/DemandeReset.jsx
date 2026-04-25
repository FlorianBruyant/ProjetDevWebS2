import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const DemandeReset = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [messageErreur, setMessageErreur] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();
        setStatus('loading');
        setMessageErreur('');

        try {
            const response = await fetch('http://localhost:8000/api/password_reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setStatus('success');
            } else {
                const data = await response.json();
                setStatus('error');
                setMessageErreur(data.error || "Cet email n'est pas reconnu dans notre système.");
            }
        } catch (error) {
            setStatus('error');
            setMessageErreur('Connexion au serveur impossible.');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    mt: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 3,
                        position: 'relative',
                    }}>
                    {/* Bouton retour */}
                    <IconButton onClick={() => navigate('/connexion')} sx={{ position: 'absolute', top: 8, left: 8 }}>
                        <ArrowBack />
                    </IconButton>

                    <Typography component="h1" variant="h5" textAlign="center" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                        Mot de passe oublié ?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
                        Entrez votre email pour recevoir un lien de réinitialisation.
                    </Typography>

                    {status === 'success' ? (
                        <Alert severity="success" variant="filled" sx={{ borderRadius: 2 }}>
                            Lien envoyé ! Vérifiez votre boîte <strong>Mailtrap</strong>.
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {messageErreur}
                                </Alert>
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Adresse E-mail"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={status === 'loading'}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={status === 'loading'}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    borderRadius: 2,
                                    fontWeight: 'bold',
                                }}>
                                {status === 'loading' ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    'Envoyer le lien'
                                )}
                            </Button>
                        </form>
                    )}

                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                            <RouterLink
                                to="/connexion"
                                style={{
                                    textDecoration: 'none',
                                    color: '#1976d2',
                                }}>
                                Retour à la connexion
                            </RouterLink>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default DemandeReset;

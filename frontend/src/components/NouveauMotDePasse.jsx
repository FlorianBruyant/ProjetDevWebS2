import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Container, Alert } from '@mui/material';

const NouveauMotDePasse = () => {
    const { uid, token } = useParams(); // Récupère l'UID et le Token de l'URL
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [message, setMessage] = useState('');

    const handleSubmit = async e => {
        e.preventDefault();

        // 1. Vérification de correspondance
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Les mots de passe ne correspondent pas.');
            return;
        }

        // 2. Vérification de la force du mot de passe (Regex)
        // Min 8 caractères, 1 Majuscule, 1 Minuscule, 1 Chiffre
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(password)) {
            setStatus('error');
            setMessage(
                'Sécurité insuffisante : le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.'
            );
            return;
        }

        setStatus('loading');

        try {
            const response = await fetch(`http://localhost:8000/api/password_reset_confirm/${uid}/${token}/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (response.ok) {
                setStatus('success');
                setTimeout(() => navigate('/connexion'), 3000);
            } else {
                setStatus('error');
                setMessage('Le lien est invalide ou a expiré.');
            }
        } catch {
            setStatus('error');
            setMessage('Erreur de connexion au serveur.');
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
                    <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
                        Nouveau mot de passe
                    </Typography>

                    {status === 'success' ? (
                        <Alert severity="success">Mot de passe modifié ! Redirection vers la connexion...</Alert>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {message}
                                </Alert>
                            )}

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Nouveau mot de passe"
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                helperText="8 caractères min, 1 majuscule, 1 chiffre"
                                // Affiche le champ en rouge si le format est invalide pendant la saisie
                                error={password.length > 0 && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirmer le mot de passe"
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                error={confirmPassword.length > 0 && confirmPassword !== password}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}
                                disabled={status === 'loading'}>
                                {status === 'loading' ? 'Enregistrement...' : 'Réinitialiser'}
                            </Button>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default NouveauMotDePasse;

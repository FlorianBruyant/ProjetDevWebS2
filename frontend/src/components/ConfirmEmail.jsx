import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Paper, Button, Alert } from '@mui/material';

const ConfirmEmail = () => {
    const { uid, token } = useParams(); // Récupère les variables de l'URL
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // loading, success, error

    useEffect(() => {
        const activerCompte = async () => {
            try {
                // On appelle la vue ActivateAccountView de Django
                const response = await fetch(`http://localhost:8000/api/activate/${uid}/${token}/`);

                if (response.ok) {
                    setStatus('success');
                } else {
                    setStatus('error');
                }
            } catch (error) {
                setStatus('error');
            }
        };

        activerCompte();
    }, [uid, token]);

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <Paper
                sx={{
                    p: 4,
                    maxWidth: 400,
                    textAlign: 'center',
                    borderRadius: 3,
                }}>
                {status === 'loading' && (
                    <>
                        <CircularProgress sx={{ mb: 2 }} />
                        <Typography>Activation de votre compte en cours...</Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <Alert severity="success" sx={{ mb: 3 }}>
                            Votre compte est désormais actif !
                        </Alert>
                        <Typography sx={{ mb: 3 }}>Vous pouvez maintenant vous connecter à votre espace.</Typography>
                        <Button variant="contained" fullWidth onClick={() => navigate('/connexion')}>
                            Se connecter
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <Alert severity="error" sx={{ mb: 3 }}>
                            Le lien est invalide ou a expiré.
                        </Alert>
                        <Button variant="outlined" fullWidth onClick={() => navigate('/inscription')}>
                            Retour à l'inscription
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
};

export default ConfirmEmail;

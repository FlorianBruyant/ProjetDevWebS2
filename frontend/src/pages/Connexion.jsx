import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    InputAdornment,
    IconButton,
    Grid,
    Link as MuiLink,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined } from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

const Connexion = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // États pour les champs
    const [credentials, setCredentials] = useState({
        username: '',
        password: '',
    });

    // États pour l'UI
    const [showPassword, setShowPassword] = useState(false);
    const [erreur, setErreur] = useState('');
    const [chargement, setChargement] = useState(false);

    // Message de succès venant de la page d'inscription
    const messageSucces = location.state?.message;

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErreur('');
        setChargement(true);

        try {
            const response = await fetch('http://localhost:8000/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (response.ok) {
                // --- STOCKAGE DES TOKENS ---
                // On stocke le token d'accès pour les requêtes API
                localStorage.setItem('access_token', data.access);
                // On stocke le refresh token pour renouveler la session plus tard
                localStorage.setItem('refresh_token', data.refresh);

                // Optionnel : stocker le nom d'utilisateur pour l'afficher dans la barre de menu
                localStorage.setItem('username', credentials.username);

                // Redirection vers la carte
                navigate('/carte');
            } else {
                setErreur("Nom d'utilisateur ou mot de passe incorrect.");
            }
        } catch {
            setErreur('Erreur de connexion au serveur.');
        } finally {
            setChargement(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                sx={{
                    mt: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 3,
                        textAlign: 'center',
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: 'secondary.main',
                            color: 'white',
                            p: 2,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            mb: 2,
                        }}
                    >
                        <LockOutlined fontSize="large" />
                    </Box>

                    <Typography component="h1" variant="h5" fontWeight="bold">
                        Connexion
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Accédez à votre tableau de bord Smart City
                    </Typography>

                    {messageSucces && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {messageSucces}
                        </Alert>
                    )}
                    {erreur && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {erreur}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Nom d'utilisateur"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            onChange={handleChange}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            label="Mot de passe"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            onChange={handleChange}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() =>
                                                setShowPassword(!showPassword)
                                            }
                                        >
                                            {showPassword ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mt: 1,
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        value="remember"
                                        color="primary"
                                    />
                                }
                                label={
                                    <Typography variant="body2">
                                        Se souvenir de moi
                                    </Typography>
                                }
                            />
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={chargement}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: 'bold',
                            }}
                        >
                            {chargement ? 'Connexion...' : 'Se connecter'}
                        </Button>

                        <Grid container justifyContent="center">
                            <MuiLink
                                component={RouterLink}
                                to="/inscription"
                                variant="body2"
                                sx={{ textDecoration: 'none' }}
                            >
                                {"Pas encore de compte ? S'inscrire"}
                            </MuiLink>
                        </Grid>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Connexion;

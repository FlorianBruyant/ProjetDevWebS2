import React, { useState } from 'react';
import API_BASE_URL from '../api';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Container,
    Alert,
    AlertTitle,
    InputAdornment,
    IconButton,
    Link as MuiLink,
} from '@mui/material';
import { Visibility, VisibilityOff, PersonAddOutlined } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Inscription = () => {
    // États pour le formulaire
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password_confirm: '',
        first_name: '',
        last_name: '',
    });

    // États pour l'interface
    const [showPassword, setShowPassword] = useState(false);
    const [erreur, setErreur] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [chargement, setChargement] = useState(false);

    // Regex : 8 caractères, 1 Majuscule, 1 Minuscule, 1 Chiffre
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setErreur('');

        // 1. Validation de correspondance
        if (formData.password !== formData.password_confirm) {
            setErreur('Les mots de passe ne correspondent pas.');
            return;
        }

        // 2. Validation de force du mot de passe
        if (!passwordRegex.test(formData.password)) {
            setErreur('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre.');
            return;
        }

        setChargement(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.password_confirm,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: 'VISITEUR',
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
            } else {
                const message = data.username || data.email || data.password || data.detail || "Erreur lors de l'inscription";
                setErreur(Array.isArray(message) ? message[0] : message);
            }
        } catch {
            setErreur('Impossible de contacter le serveur.');
        } finally {
            setChargement(false);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{ mt: 8, mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={4} sx={{ p: 4, width: '100%', borderRadius: 3, textAlign: 'center' }}>
                    <Box
                        sx={{
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 2,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            mb: 2,
                        }}>
                        <PersonAddOutlined fontSize="large" />
                    </Box>

                    <Typography component="h1" variant="h5" fontWeight="bold" gutterBottom>
                        Créer un compte
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Rejoignez ParisLive
                    </Typography>

                    {erreur && (
                        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                            {erreur}
                        </Alert>
                    )}

                    {isSuccess ? (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
                                <AlertTitle>Inscription réussie !</AlertTitle>
                                E-mail envoyé à <strong>{formData.email}</strong>. Vérifiez <strong>Mailtrap</strong> pour activer
                                votre compte.
                            </Alert>
                            <Button
                                component={RouterLink}
                                to="/connexion"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, py: 1.5, borderRadius: 2 }}>
                                Aller à la page de connexion
                            </Button>
                        </Box>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField margin="normal" fullWidth label="Prénom" name="first_name" onChange={handleChange} />
                                <TextField margin="normal" fullWidth label="Nom" name="last_name" onChange={handleChange} />
                            </Box>

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Nom d'utilisateur"
                                name="username"
                                onChange={handleChange}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                onChange={handleChange}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Mot de passe"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                onChange={handleChange}
                                error={formData.password.length > 0 && !passwordRegex.test(formData.password)}
                                helperText="Min. 8 caractères, 1 majuscule, 1 chiffre"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Confirmer le mot de passe"
                                name="password_confirm"
                                type="password"
                                onChange={handleChange}
                                error={formData.password_confirm.length > 0 && formData.password !== formData.password_confirm}
                                helperText={
                                    formData.password_confirm.length > 0 && formData.password !== formData.password_confirm
                                        ? 'Les mots de passe ne correspondent pas'
                                        : ''
                                }
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={chargement}
                                sx={{ mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}>
                                {chargement ? 'Inscription...' : "S'inscrire"}
                            </Button>

                            <MuiLink component={RouterLink} to="/connexion" variant="body2" sx={{ textDecoration: 'none' }}>
                                Déjà un compte ? Connectez-vous
                            </MuiLink>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Inscription;

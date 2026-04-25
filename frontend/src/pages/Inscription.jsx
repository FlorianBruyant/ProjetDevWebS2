import React, { useState } from 'react';
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
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Inscription = () => {
    const navigate = useNavigate();

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

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setErreur('');
        setChargement(true);

        // Validation basique côté Front
        if (formData.password !== formData.password_confirm) {
            setErreur('Les mots de passe ne correspondent pas.');
            setChargement(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    password_confirm: formData.password_confirm,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    role: 'VISITEUR', // Valeur par défaut pour le CustomUser
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Succès
                setIsSuccess(true);
            } else {
                // Extraction des erreurs renvoyées par le Serializer Django
                const message =
                    data.username || data.email || data.password || data.detail || "Erreur lors de l'inscription";
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
            <Box
                sx={{
                    mt: 8,
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}>
                <Paper
                    elevation={4}
                    sx={{
                        p: 4,
                        width: '100%',
                        borderRadius: 3,
                        textAlign: 'center',
                    }}>
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
                        Rejoignez la plateforme Smart City Cergy
                    </Typography>

                    {erreur && (
                        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
                            {erreur}
                        </Alert>
                    )}
                    {/* --- AFFICHAGE DU MESSAGE DE SUCCÈS --- */}
                    {isSuccess ? (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity="success" variant="outlined" sx={{ borderRadius: 2 }}>
                                <AlertTitle>Inscription réussie !</AlertTitle>
                                Un e-mail de confirmation a été envoyé à <strong>{formData.email}</strong>.
                                <br />
                                <br />
                                Veuillez cliquer sur le lien dans l'e-mail (sur <strong>Mailtrap</strong>) pour activer
                                votre compte avant de vous connecter.
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
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Prénom"
                                    name="first_name"
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    fullWidth
                                    label="Nom"
                                    name="last_name"
                                    onChange={handleChange}
                                />
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
                            />

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
                                    fontSize: '1rem',
                                }}>
                                {chargement ? 'Inscription...' : "S'inscrire"}
                            </Button>

                            <MuiLink
                                component={RouterLink}
                                to="/connexion"
                                variant="body2"
                                sx={{
                                    cursor: 'pointer',
                                    textDecoration: 'none',
                                }}>
                                {'Déjà un compte ? Connectez-vous'}
                            </MuiLink>
                        </form>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Inscription;

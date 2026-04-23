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
    Link,
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    PersonAddOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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
    const [chargement, setChargement] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
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
            const response = await fetch(
                'http://localhost:8000/api/register/',
                {
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
                },
            );

            const data = await response.json();

            if (response.ok) {
                // Succès : redirection vers la page de connexion
                navigate('/connexion', {
                    state: { message: 'Inscription réussie ! Connectez-vous.' },
                });
            } else {
                // Extraction des erreurs renvoyées par le Serializer Django
                const message =
                    data.username ||
                    data.email ||
                    data.password ||
                    data.detail ||
                    "Erreur lors de l'inscription";
                setErreur(Array.isArray(message) ? message[0] : message);
            }
        } catch {
            setErreur(
                'Impossible de joindre le serveur. Vérifiez que le Backend est lancé.',
            );
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
                            bgcolor: 'primary.main',
                            color: 'white',
                            p: 2,
                            borderRadius: '50%',
                            display: 'inline-flex',
                            mb: 2,
                        }}
                    >
                        <PersonAddOutlined fontSize="large" />
                    </Box>

                    <Typography
                        component="h1"
                        variant="h5"
                        fontWeight="bold"
                        gutterBottom
                    >
                        Créer un compte
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Rejoignez la plateforme Smart City Cergy
                    </Typography>

                    {erreur && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, textAlign: 'left' }}
                        >
                            {erreur}
                        </Alert>
                    )}

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
                            }}
                        >
                            {chargement ? 'Inscription...' : "S'inscrire"}
                        </Button>

                        <Link
                            href="/connexion"
                            variant="body2"
                            sx={{ cursor: 'pointer', textDecoration: 'none' }}
                        >
                            {'Déjà un compte ? Connectez-vous'}
                        </Link>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default Inscription;

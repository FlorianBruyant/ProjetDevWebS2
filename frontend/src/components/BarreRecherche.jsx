import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    TextField,
    InputAdornment,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography,
    IconButton,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Search,
    History,
    Close,
    DirectionsBus,
    LocalParking,
    Traffic,
    Map as MapIcon,
    LocationOn,
    Event,
    DeleteOutlined,
} from '@mui/icons-material';

const BarreRecherche = ({
    recherche,
    setRecherche,
    rechercheActive,
    setRechercheActive,
    categorieActuelle,
    zoneSelectionnee,
    setZoneSelectionnee,
    zones,
    aucunResultat,
    termeFixe,
    inputRef,
    chargerDonnees,
}) => {
    // Charger l'historique depuis le localStorage au démarrage
    const [historique, setHistorique] = useState(() => {
        const sauvegarde = localStorage.getItem('historique_recherche');
        return sauvegarde ? JSON.parse(sauvegarde) : [];
    });

    // Sauvegarder dans le localStorage quand l'historique change
    useEffect(() => {
        localStorage.setItem('historique_recherche', JSON.stringify(historique));
    }, [historique]);

    const ajouterAHistorique = terme => {
        if (!terme || terme.trim() === '') return;
        setHistorique(prev => {
            // On enlève le terme s'il existe déjà pour le remettre en haut, et on limite à 5
            const nouveau = [terme, ...prev.filter(item => item !== terme)].slice(0, 5);
            return nouveau;
        });
    };

    const supprimerDeLHistorique = (e, terme) => {
        e.stopPropagation(); // Empêche de déclencher la recherche
        setHistorique(prev => prev.filter(item => item !== terme));
    };

    const executerRecherche = (cat, terme) => {
        ajouterAHistorique(terme);
        chargerDonnees(cat, terme, false, zoneSelectionnee);
        setRechercheActive(false);
        inputRef.current?.blur();
    };

    return (
        <Paper
            elevation={rechercheActive ? 0 : 3}
            sx={{
                position: 'absolute',
                top: rechercheActive ? 0 : 20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: rechercheActive ? '100%' : '90%',
                maxWidth: rechercheActive ? 'none' : 600,
                borderRadius: rechercheActive ? 0 : 8,
                bgcolor: 'white',
                pt: rechercheActive ? 2 : 0,
                zIndex: 1000,
                transition: 'all 0.3s ease-in-out',
                minHeight: rechercheActive ? '100vh' : 'auto',
            }}>
            {/* --- Champ de recherche --- */}
            <Box sx={{ display: 'flex', alignItems: 'center', px: 2, mb: rechercheActive ? 2 : 0 }}>
                {rechercheActive && (
                    <IconButton onClick={() => setRechercheActive(false)} sx={{ mr: 1 }}>
                        <Close />
                    </IconButton>
                )}
                <TextField
                    fullWidth
                    variant="standard"
                    placeholder="Rechercher un objet, une rue..."
                    inputRef={inputRef}
                    onFocus={() => setRechercheActive(true)}
                    value={recherche}
                    onChange={e => setRecherche(e.target.value)}
                    onKeyDown={e => {
                        if (e.key === 'Enter') executerRecherche(categorieActuelle, recherche);
                    }}
                    InputProps={{
                        disableUnderline: true,
                        startAdornment: !rechercheActive && (
                            <InputAdornment position="start">
                                <Search color="action" />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ py: 1.5 }}
                />
            </Box>

            {rechercheActive && (
                <Box sx={{ px: 2 }}>
                    {/* --- Chips des catégories --- */}
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            mb: 3,
                            overflowX: 'auto',
                            pb: 1,
                            '&::-webkit-scrollbar': { height: 6 },
                            '&::-webkit-scrollbar-thumb': { backgroundColor: '#e0e0e0', borderRadius: 10 },
                        }}>
                        {[
                            { id: 'global', label: 'Toute la ville', icon: <MapIcon /> },
                            { id: 'vehicules', label: 'Bus & Vélibs', icon: <DirectionsBus /> },
                            { id: 'parkings', label: 'Parkings', icon: <LocalParking /> },
                            { id: 'feux', label: 'Feux', icon: <Traffic /> },
                            { id: 'lieux', label: 'Lieux', icon: <LocationOn /> },
                            { id: 'evenements', label: 'Événements', icon: <Event /> },
                        ].map(cat => (
                            <Chip
                                key={cat.id}
                                icon={cat.icon}
                                label={cat.label}
                                clickable
                                color={categorieActuelle === cat.id ? 'primary' : 'default'}
                                onClick={() => executerRecherche(cat.id, recherche)}
                            />
                        ))}
                    </Stack>

                    {/* --- Filtre Quartier --- */}
                    <FormControl fullWidth size="small" sx={{ mt: 2, mb: 3 }}>
                        <InputLabel>Filtrer par quartier</InputLabel>
                        <Select
                            value={zoneSelectionnee}
                            label="Filtrer par quartier"
                            onChange={e => {
                                setZoneSelectionnee(e.target.value);
                                chargerDonnees(categorieActuelle, recherche, false, e.target.value);
                            }}>
                            <MenuItem value="">
                                <em>Tous les quartiers</em>
                            </MenuItem>
                            {zones.map(z => (
                                <MenuItem key={z.id} value={z.id}>
                                    {z.nom}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* --- Section Historique --- */}
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                        Recherches récentes
                    </Typography>

                    {historique.length > 0 ? (
                        <List sx={{ mb: 2 }}>
                            {historique.map((item, index) => (
                                <ListItem
                                    key={index}
                                    disableGutters
                                    sx={{ cursor: 'pointer', '&:hover .delete-icon': { opacity: 1 } }}
                                    onClick={() => {
                                        setRecherche(item);
                                        executerRecherche('global', item);
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            className="delete-icon"
                                            edge="end"
                                            size="small"
                                            sx={{ opacity: 0, transition: '0.2s' }}
                                            onClick={e => supprimerDeLHistorique(e, item)}>
                                            <DeleteOutlined fontSize="small" />
                                        </IconButton>
                                    }>
                                    <ListItemIcon sx={{ minWidth: 40 }}>
                                        <History fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText primary={item} />
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ py: 3, textAlign: 'center' }}>
                            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                                Aucune recherche récente
                            </Typography>
                        </Box>
                    )}

                    {/* --- Feedback Résultats --- */}
                    {aucunResultat && (
                        <Paper sx={{ p: 2, mt: 1, bgcolor: '#fff5f5', borderRadius: 2, mb: 2 }}>
                            <Typography color="error" variant="body2">
                                Aucun objet trouvé pour "<strong>{termeFixe}</strong>".
                            </Typography>
                        </Paper>
                    )}
                </Box>
            )}
        </Paper>
    );
};

export default BarreRecherche;

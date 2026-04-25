import React from 'react';
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
import { Search, History, Close, DirectionsBus, LocalParking, Traffic, Map as MapIcon } from '@mui/icons-material';

const historique = ['Gare de Cergy Préfecture', 'ESSEC Business School', 'Centre Commercial Trois Fontaines'];

const BarreRecherche = ({
    recherche,
    setRecherche,
    rechercheActive,
    setRechercheActive,
    categorieActuelle,
    zoneSelectionnee,
    setZoneSelectionnee,
    zones,
    chargement,
    donneesMap,
    aucunResultat,
    termeFixe,
    inputRef,
    chargerDonnees,
}) => {
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
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    mb: rechercheActive ? 2 : 0,
                }}>
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
                        if (e.key === 'Enter') {
                            chargerDonnees(categorieActuelle, recherche, false, zoneSelectionnee);
                            setRechercheActive(false);
                            inputRef.current?.blur();
                        }
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
                    <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
                        <Chip
                            icon={<MapIcon />}
                            label="Toute la ville"
                            onClick={() => {
                                chargerDonnees('global', recherche, false, zoneSelectionnee);
                                setRechercheActive(false);
                            }}
                            color={categorieActuelle === 'global' ? 'primary' : 'default'}
                            clickable
                        />
                        <Chip
                            icon={<DirectionsBus />}
                            label="Bus & Vélibs"
                            onClick={() => {
                                chargerDonnees('vehicules', recherche, false, zoneSelectionnee);
                                setRechercheActive(false);
                            }}
                            color={categorieActuelle === 'vehicules' ? 'primary' : 'default'}
                            clickable
                        />
                        <Chip
                            icon={<LocalParking />}
                            label="Parkings"
                            onClick={() => {
                                chargerDonnees('parkings', recherche, false, zoneSelectionnee);
                                setRechercheActive(false);
                            }}
                            color={categorieActuelle === 'parkings' ? 'primary' : 'default'}
                            clickable
                        />
                        <Chip
                            icon={<Traffic />}
                            label="Feux"
                            onClick={() => {
                                chargerDonnees('feux', recherche, false, zoneSelectionnee);
                                setRechercheActive(false);
                            }}
                            color={categorieActuelle === 'feux' ? 'primary' : 'default'}
                            clickable
                        />
                    </Stack>

                    <FormControl fullWidth size="small" sx={{ mt: 2, mb: 1 }}>
                        <InputLabel>Filtrer par quartier</InputLabel>
                        <Select
                            value={zoneSelectionnee}
                            label="Filtrer par quartier"
                            onChange={e => {
                                const val = e.target.value;
                                setZoneSelectionnee(val);
                                chargerDonnees(categorieActuelle, recherche, false, val);
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

                    {chargement && donneesMap.length === 0 && (
                        <Typography
                            sx={{
                                py: 2,
                                textAlign: 'center',
                                color: 'text.secondary',
                            }}>
                            Analyse de la ville en cours...
                        </Typography>
                    )}

                    {aucunResultat && (
                        <Paper
                            sx={{
                                p: 2,
                                mt: 1,
                                bgcolor: '#fff5f5',
                                borderRadius: 2,
                            }}>
                            <Typography color="error" variant="body2">
                                Aucun objet trouvé pour "<strong>{termeFixe}</strong>".
                            </Typography>
                        </Paper>
                    )}

                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                        Recherches récentes
                    </Typography>
                    <List>
                        {historique.map((item, index) => (
                            <ListItem
                                key={index}
                                disableGutters
                                sx={{ cursor: 'pointer' }}
                                onClick={() => {
                                    setRecherche(item);
                                    chargerDonnees('global', item);
                                    setRechercheActive(false);
                                }}>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <History fontSize="small" />
                                </ListItemIcon>
                                <ListItemText primary={item} />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
        </Paper>
    );
};

export default BarreRecherche;

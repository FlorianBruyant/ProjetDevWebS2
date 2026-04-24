import React from 'react';
import {
    Fab,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
} from '@mui/material';
import { Close, Add, LocationOn } from '@mui/icons-material';

const AjoutObjet = ({
    isAdmin,
    modeAjout,
    setModeAjout,
    openModal,
    setOpenModal,
    nouveauObjet,
    setNouveauObjet,
    handleCreerObjet,
}) => {
    return (
        <>
            {/* BOUTON FLOTTANT D'AJOUT (Uniquement pour Admin) */}
            {isAdmin && (
                <Fab
                    color={modeAjout ? 'secondary' : 'primary'}
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 90, md: 30 },
                        right: { xs: 20, md: 30 },
                        zIndex: 1000,
                    }}
                    onClick={() => setModeAjout(!modeAjout)}
                >
                    {modeAjout ? <Close /> : <Add />}
                </Fab>
            )}

            {/* MESSAGE D'INSTRUCTION */}
            {modeAjout && (
                <Alert
                    icon={<LocationOn fontSize="inherit" />}
                    severity="info"
                    sx={{
                        position: 'absolute',
                        bottom: { xs: 160, md: 100 },
                        right: { xs: 20, md: 30 },
                        zIndex: 1000,
                        boxShadow: 3,
                    }}
                >
                    Cliquez n'importe où sur la carte pour placer l'objet.
                </Alert>
            )}

            {/* --- LE MODAL DE CRÉATION DE L'OBJET --- */}
            <Dialog
                open={openModal}
                onClose={() => setOpenModal(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    Créer un équipement connecté
                </DialogTitle>
                <DialogContent
                    sx={{
                        pt: '20px !important',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 3,
                    }}
                >
                    <FormControl fullWidth>
                        <InputLabel>Type d'équipement</InputLabel>
                        <Select
                            value={nouveauObjet.type_api}
                            label="Type d'équipement"
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    type_api: e.target.value,
                                })
                            }
                        >
                            <MenuItem value="feux">Feu Tricolore</MenuItem>
                            <MenuItem value="vehicules">
                                Bus / Véhicule
                            </MenuItem>
                            <MenuItem value="parkings">Parking</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField
                        label="Nom de l'objet (ex: Feu croisement Nord)"
                        fullWidth
                        value={nouveauObjet.nom}
                        onChange={(e) =>
                            setNouveauObjet({
                                ...nouveauObjet,
                                nom: e.target.value,
                            })
                        }
                    />

                    {nouveauObjet.type_api === 'vehicules' && (
                        <TextField
                            label="Plaque d'immatriculation"
                            fullWidth
                            value={nouveauObjet.details}
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    details: e.target.value,
                                })
                            }
                        />
                    )}

                    {nouveauObjet.type_api === 'parkings' && (
                        <TextField
                            label="Nombre de places totales"
                            type="number"
                            fullWidth
                            value={nouveauObjet.details}
                            onChange={(e) =>
                                setNouveauObjet({
                                    ...nouveauObjet,
                                    details: e.target.value,
                                })
                            }
                        />
                    )}

                    <TextField
                        label="Description (Optionnel)"
                        multiline
                        rows={3}
                        fullWidth
                        value={nouveauObjet.description}
                        onChange={(e) =>
                            setNouveauObjet({
                                ...nouveauObjet,
                                description: e.target.value,
                            })
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setOpenModal(false)} color="inherit">
                        Annuler
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreerObjet}
                        disableElevation
                    >
                        Placer sur la carte
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AjoutObjet;

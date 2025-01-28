import * as React from 'react';
import Modal from '@mui/material/Modal';
import { Box, Button, TextField, Typography, Container, CssBaseline, useTheme } from "@mui/material";
import { useState } from "react";
import axios from 'axios';
import {Socket} from "socket.io-client";

interface AccountModalProps {
    isConnected: boolean;
    setIsConnected: (isConnected: boolean) => void;
    setIsUsernameSet: (isUsernameSet: boolean) => void;
    setUsername: (username: string) => void;
    socket: Socket | null;
}

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: '10px',
    p: 4,
};

export default function AccountModal({ isConnected, setIsConnected, setIsUsernameSet, setUsername, socket }: AccountModalProps) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', formData);
            console.log("Connexion réussie:", response.data);
            setIsConnected(true);
            setIsUsernameSet(true);
            setUsername(response.data.pseudo);
            if (socket) {
                socket.emit('set-username', response.data.pseudo);
            }
            handleClose();
        } catch (err) {
            console.error("Erreur lors de la connexion", err);
            setErrorMessage("Identifiants incorrects. Veuillez réessayer.");
        }
    };

    const handleLogout = () => {
        setIsConnected(false);
        window.location.reload(); // Recharger la page
    };
    const handleConnect = () => {
        const trimmedUsername = username.trim();
        setIsConnected(true);
        setIsUsernameSet(true);
        console.log("Connecté");
        console.log("Nom d'utilisateur défini:", trimmedUsername);

    };

    const theme = useTheme();

    return (
        <div>
            {isConnected ? (
                <Button
                    onClick={handleLogout}
                    style={{ cursor: 'pointer', color: theme.palette.mode === 'dark' ? '#fff' : '#000', margin: '0px 10px 0px 10px'}}
                >
                    Déconnexion
                </Button>
            ) : (
                <Button
                    onClick={handleOpen}
                    style={{ cursor: 'pointer', color: theme.palette.mode === 'dark' ? '#fff' : '#000', margin: '0px 10px 0px 10px'}}
                >
                    Connexion
                </Button>
            )}

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <Box
                            sx={{
                                marginTop: 8,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Typography component="h1" variant="h5">
                                Connexion
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Adresse email"
                                    name="email"
                                    autoComplete="off"
                                    autoFocus
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Mot de passe"
                                    type="password"
                                    id="password"
                                    autoComplete="off"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errorMessage && (
                                    <Typography color="error" variant="body2" align="center">
                                        {errorMessage}
                                    </Typography>
                                )}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Se connecter
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Modal>
        </div>
    );
}
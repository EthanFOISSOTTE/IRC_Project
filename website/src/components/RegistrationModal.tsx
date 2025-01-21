import * as React from 'react';
import Modal from '@mui/material/Modal';
import { Box, Button, TextField, Typography, Container, CssBaseline, useTheme } from "@mui/material";
import { useState } from "react";
import axios from 'axios';

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

export default function RegistrationModal() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [formData, setFormData] = useState({
        email: "",
        pseudo: "",
        password: "",
        passwordConfirm: "",
    });

    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.passwordConfirm) {
            setError("Les mots de passe doivent être identiques");
        } else {
            setError("");
            try {
                await axios.post('/register', {
                    email: formData.email,
                    pseudo: formData.pseudo,
                    password: formData.password,
                });
                console.log("Utilisateur créé avec succès");
                handleClose();
            } catch (err) {
                console.error("Erreur lors de la création de l'utilisateur", err);
            }
        }
    };

    const theme = useTheme();

    return (
        <div>
            <Button
                onClick={handleOpen}
                style={{ cursor: 'pointer', color: theme.palette.mode === 'dark' ? '#fff' : '#000', margin: '0px 10px 0px 10px' }}
            >
                Register
            </Button>

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
                                Registration
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
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
                                    id="pseudo"
                                    label="Pseudo"
                                    name="pseudo"
                                    autoComplete="off"
                                    autoFocus
                                    value={formData.pseudo}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="off"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="passwordConfirm"
                                    label="Confirm password"
                                    type="password"
                                    id="passwordConfirm"
                                    autoComplete="off"
                                    value={formData.passwordConfirm}
                                    onChange={handleChange}
                                />
                                {error && (
                                    <Typography color="error" variant="body2">
                                        {error}
                                    </Typography>
                                )}
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Register
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Modal>
        </div>
    );
}
import * as React from 'react';
import Modal from '@mui/material/Modal';
import { Box, Button, TextField, Typography, Container, CssBaseline } from "@mui/material";
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

export default function AddChannelModal() {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [formData, setFormData] = useState({
        chanelName: "",
        chanelDesc: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            await axios.post('/create', {
                chanelName: formData.chanelName,
                chanelDesc: formData.chanelDesc,
            });
            console.log("Channel créé avec succès");
            handleClose();
        } catch (err) {
            console.error("Erreur lors de la création du channel", err);
        }
    };

    return (
        <div>
            <Button onClick={handleOpen}>Add Channel</Button>
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
                                Add Channel
                            </Typography>
                            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="chanelName"
                                    label="Channel Name"
                                    name="chanelName"
                                    autoComplete="off"
                                    autoFocus
                                    value={formData.chanelName}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="chanelDesc"
                                    label="Channel Description"
                                    name="chanelDesc"
                                    autoComplete="off"
                                    value={formData.chanelDesc}
                                    onChange={handleChange}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                >
                                    Create
                                </Button>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Modal>
        </div>
    );
}
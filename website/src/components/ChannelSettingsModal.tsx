import Modal from '@mui/material/Modal';
import { Box, Typography, Container, CssBaseline, useTheme } from "@mui/material";
import React, { useState } from "react";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import OnlineList from "./OnlineList";

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

interface ChannelSettingsModalProps {
    onlineUsers: string[];
}

export default function ChannelSettingsModal({ onlineUsers }: ChannelSettingsModalProps) {
    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const openDropdown = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseDropdown = () => {
        setAnchorEl(null);
    };

    const theme = useTheme();

    const [openOnlineList, setOpenOnlineList] = useState(false);
    const handleOpenOnlineList = () => setOpenOnlineList(true);
    const handleCloseOnlineList = () => setOpenOnlineList(false);

    return (
        <div>
            <IconButton
                aria-label="more"
                id="long-button"
                aria-controls={openDropdown ? 'long-menu' : undefined}
                aria-expanded={openDropdown ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                style={{ cursor: 'pointer', color: theme.palette.mode === 'dark' ? '#fff' : '#000' }}
            >
                <MoreVertIcon />
            </IconButton>
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={openDropdown}
                onClose={handleCloseDropdown}
                slotProps={{
                    paper: {
                        style: {
                            width: '20ch',
                        },
                    },
                }}
            >
                <MenuItem onClick={() => { handleOpen(); handleCloseDropdown(); }}>
                    <Typography>
                        Settings
                    </Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleOpenOnlineList(); handleCloseDropdown(); }}>
                    <Typography>
                        Online users
                    </Typography>
                </MenuItem>
            </Menu>

            {/* Settings Modal */}
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
                                marginTop: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Typography component="h1" variant="h5">
                                Settings
                            </Typography>
                            <Box>
                                <Typography component="h1" variant="h5">
                                    Ici les options
                                </Typography>
                            </Box>
                        </Box>
                    </Container>
                </Box>
            </Modal>

            {/* Online Users Modal */}
            <Modal
                open={openOnlineList}
                onClose={handleCloseOnlineList}
                aria-labelledby="online-list-modal-title"
                aria-describedby="online-list-modal-description"
            >
                <Box sx={style}>
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <Box
                            sx={{
                                marginTop: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                height: "100%",
                            }}
                        >
                            <Typography component="h1" variant="h5" id="online-list-modal-title" style={{ marginBottom: "5%" }}>
                                🟢 Online Users
                            </Typography>
                            <OnlineList isMobile={true} handleDrawerToggle={handleCloseOnlineList} onlineUsers={onlineUsers} />
                        </Box>
                    </Container>
                </Box>
            </Modal>
        </div>
    );
}
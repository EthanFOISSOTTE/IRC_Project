import { useState } from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatIcon from "@mui/icons-material/Chat";
import AccountModal from "./AccountModal.tsx";
import { Socket } from "socket.io-client";

interface ChannelsListProps {
    isMobile: boolean;
    handleDrawerToggle: () => void;
    isConnected: boolean;
    setIsConnected: (isConnected: boolean) => void;
    setIsUsernameSet: (isUsernameSet: boolean) => void;
    setUsername: (username: string) => void;
    socket: Socket | null;
    openAccountModal: () => void;
}

const dummyChats = [
    {
        id: 1,
        name: "John",
        lastMessage: "Hey, how are you?",
    },
    {
        id: 2,
        name: "Liane",
        lastMessage: "See you tomorrow!",
    },
];

const ChannelsList: React.FC<ChannelsListProps> = ({ isMobile, handleDrawerToggle, isConnected, setIsConnected, setIsUsernameSet, setUsername, socket, openAccountModal }) => {
    const theme = useTheme();
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const handleAddChannelClick = () => {
        if (isConnected) {
            // Création d'un channel
            console.log("Add a channel");
        } else {
            // Modal de connexion
            openAccountModal();
        }
    };

    const handleCloseAccountModal = () => {
        setIsAccountModalOpen(false);
    };

    return (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                    Channels
                </Typography>
                <AddCircleIcon
                    style={{ cursor: 'pointer' }}
                    id='add-channel'
                    onClick={handleAddChannelClick}
                />
            </div>
            <Stack spacing={2}>
                {dummyChats.map((chat) => (
                    <Box
                        key={chat.id}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            cursor: "pointer",
                            p: 1,
                            borderRadius: 1,
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <ChatIcon style={{ fontSize: 40 }} />
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {chat.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {chat.lastMessage}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
            <AccountModal
                isConnected={isConnected}
                setIsConnected={setIsConnected}
                setIsUsernameSet={setIsUsernameSet}
                setUsername={setUsername}
                socket={socket}
                open={isAccountModalOpen}
                onClose={handleCloseAccountModal}
            />
        </>
    );
};

export default ChannelsList;
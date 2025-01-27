import { Box, Stack, Typography, useTheme } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChatIcon from "@mui/icons-material/Chat";

interface OnlineListProps {
    isMobile: boolean;
    handleDrawerToggle: () => void;
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

const OnlineList: React.FC<OnlineListProps> = ({ isMobile, handleDrawerToggle }) => {
    const theme = useTheme();

    return (
        <>
            <div style={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="body2" color="text.secondary">
                    Channels
                </Typography>
                <AddCircleIcon
                    style={{cursor: 'pointer'}}
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
                            "&:hover": {backgroundColor: theme.palette.action.hover},
                        }}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <ChatIcon style={{fontSize: 40}}/>
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
        </>
    );
};

export default OnlineList;
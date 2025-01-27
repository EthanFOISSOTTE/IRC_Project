import { useEffect, useState } from "react";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

interface OnlineListProps {
    isMobile: boolean;
    handleDrawerToggle: () => void;
}

const OnlineList: React.FC<OnlineListProps> = ({ isMobile, handleDrawerToggle }) => {
    const theme = useTheme();
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        socket.on("connected-users", (users: string[]) => {
            setOnlineUsers(users);
        });

        return () => {
            socket.off("connected-users");
        };
    }, []);

    return (
        <>
            {!isMobile && (
                <Typography variant="body2" color="text.secondary">
                    Online
                </Typography>
            )}

            <Stack spacing={2}>
                {onlineUsers.map((name, index) => (
                    <Box
                        key={index}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            borderRadius: 1,
                            paddingLeft: "10px",
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <PersonIcon style={{ fontSize: 20, paddingRight: '5px' }} />
                        <Box>
                            <Typography
                                variant="subtitle1"
                                fontWeight="bold"
                                fontSize="0.875rem"
                            >
                                {name}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </>
    );
};

export default OnlineList;
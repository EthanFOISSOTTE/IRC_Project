import { Box, Stack, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface OnlineListProps {
    isMobile: boolean;
    handleDrawerToggle: () => void;
    onlineUsers: string[];
}

const OnlineList: React.FC<OnlineListProps> = ({ isMobile, handleDrawerToggle, onlineUsers }) => {
    const theme = useTheme();

    return (
        <>
            <Typography variant="body2" color="text.secondary">
                Online
            </Typography>

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
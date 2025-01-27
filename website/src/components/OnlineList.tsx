import { Box, Stack, Typography, useTheme } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const dummyOnlines = [
    { id: 1, name: "John" },
    { id: 2, name: "Liane" },
    { id: 3, name: "Ethane" },
    { id: 4, name: "Alexy" },
    { id: 5, name: "Jean" },
    { id: 6, name: "Deyan" },
    { id: 7, name: "Mickael" },
];

interface OnlineListProps {
    isMobile: boolean;
    handleDrawerToggle: () => void;
}

const OnlineList: React.FC<OnlineListProps> = ({ isMobile, handleDrawerToggle }) => {
    const theme = useTheme();

    return (
        <>
            {!isMobile && (
                <Typography variant="body2" color="text.secondary">
                    Online
                </Typography>
            )}

            <Stack spacing={2}>
                {dummyOnlines.map((online) => (
                    <Box
                        key={online.id}
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
                                {online.name}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>
        </>
    );
};

export default OnlineList;
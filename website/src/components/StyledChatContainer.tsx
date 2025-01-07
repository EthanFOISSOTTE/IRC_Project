import {styled} from "@mui/system";
import {Box} from "@mui/material";

const StyledChatContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    height: "90vh",
    gap: 2,
    padding: theme.spacing(2),
    backgroundColor: theme.palette.mode === "dark" ? "#1a1a1a" : "#f5f5f5",
    [theme.breakpoints.down("md")]: {
        padding: theme.spacing(1),
        height: "calc(100vh - 70px)",
    },
}));

export default StyledChatContainer;
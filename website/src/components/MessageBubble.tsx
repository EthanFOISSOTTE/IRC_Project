import { styled } from "@mui/system";
import { Card } from "@mui/material";

const MessageBubble = styled(Card)(({ theme }) => ({
    maxWidth: "70%",
    padding: "12px 16px",
    backgroundColor: theme.palette.mode === "dark" ? "#424242" : "#fff",
    color: theme.palette.mode === "dark" ? "#fff" : "inherit",
    borderRadius: "16px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
    "&:hover": {
        transform: "scale(1.02)",
    },
}));

export default MessageBubble;
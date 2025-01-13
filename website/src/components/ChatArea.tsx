import {styled} from "@mui/system";
import {Paper} from "@mui/material";

const ChatArea = styled(Paper)(({ theme }) => ({
    flex: 1,
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
}));

export default ChatArea;
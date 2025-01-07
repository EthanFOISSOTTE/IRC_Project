import {styled} from "@mui/system";
import {Box} from "@mui/material";

const MessageContainer = styled(Box)<{ sent: boolean }>(({ sent }) => ({
    display: "flex",
    justifyContent: sent ? "flex-end" : "flex-start",
    marginBottom: "8px",
}));

export default MessageContainer;
import {styled} from "@mui/system";
import {Paper} from "@mui/material";

const SidePanel = styled(Paper)(({ theme }) => ({
    width: "300px",
    padding: theme.spacing(2),
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    backgroundColor: theme.palette.mode === "dark" ? "#2d2d2d" : "#ffffff",
    [theme.breakpoints.down("md")]: {
        width: "100%",
    },
}));

export default SidePanel;
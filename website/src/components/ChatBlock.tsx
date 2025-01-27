import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    useTheme,
    ThemeProvider,
    createTheme,
    CssBaseline,
    useMediaQuery,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
} from "@mui/material";
import { IoMenu, IoMoon, IoSunny } from "react-icons/io5";
import StyledChatContainer from "./StyledChatContainer";
import SidePanel from "./SidePanel";
import AccountModal from "./AccountModal";
import { io, Socket } from 'socket.io-client';
import RegistrationModal from "./RegistrationModal.tsx";
import { format } from 'date-fns';
import OnlineList from "./OnlineList";
import ChannelsList from "./ChannelsList.tsx";
import ChatAreaChannel from "./ChatAreaChannel.tsx";

const ChatBlock = () => {
    const theme = useTheme();

    {/* Socket */}
    const [socket, setSocket] = useState<Socket | null>(null);

    {/* Personnalisation */}
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");
    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const renderMobileMenu = () => (
        <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ "& .MuiDrawer-paper": { width: "80%" } }}
        >
            <Box sx={{ p: 2 }}>
                <SidePanel>
                    <AccountModal
                        isConnected={isConnected}
                        setIsConnected={setIsConnected}
                        setIsUsernameSet={setIsUsernameSet}
                        setUsername={setUsername}
                        socket={socket}
                    />
                    {!isConnected && <RegistrationModal />}
                    <hr style={{width: "100%"}}/>
                    <ChannelsList isMobile={isMobile} handleDrawerToggle={handleDrawerToggle}/>
                </SidePanel>
            </Box>
        </Drawer>
    );

    {/* Utilisateur */}
    const [username, setUsername] = useState<string>('');
    const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [messages, setMessages] = useState<
        { user: string; text: string; sent: boolean; timestamp: string }[]
    >([]);
    const [inputValue, setInputValue] = useState("");
    const handleSetUsername = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername && socket) {
            socket.emit('set-username', trimmedUsername);
            setIsUsernameSet(true);
            setIsConnected(true); // Mettre à jour isConnected à true
            console.log("Nom d'utilisateur défini:", trimmedUsername);
        } else {
            alert("Veuillez entrer un nom d'utilisateur.");
        }
    };
    const addMessage = (user: string, text: string, sent: boolean, timestamp?: string) => {
        setMessages((prev) => [...prev, { user, text, sent, timestamp: timestamp || "" }]);
    };
    const handleSendMessage = () => {
        if (inputValue && socket && isUsernameSet) {
            socket.emit("message", { text: inputValue, user: username }); // Envoyer le message avec le pseudo
            setInputValue("");
            console.log("Message envoyé:", inputValue);
        }
    };

    {/* Thème */}
    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };
    const customTheme = createTheme({
        palette: {
            mode: mode,
        },
    });

    {/* Formatage Date */}
    const formatDate = (dateString: string) => {
        if (!dateString) {
            return "";
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid date";
        }
        return format(date, 'dd/MM/yyyy HH:mm');
    };

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");

        const newSocket = io(`ws://${window.location.hostname}:3000`, {
            withCredentials: true,
        });

        setSocket(newSocket);

        newSocket.on("message", (msg: { user: string; text: string; sent: boolean; timestamp: string }) => {
            addMessage(msg.user, msg.text, msg.sent, msg.timestamp);
        });

        newSocket.on("previousMessages", (msgs: { user: string; text: string; sent: boolean; timestamp: string }[]) => {
            const formattedMessages = msgs.map((msg) => ({
                ...msg,
                sent: false,
            }));
            setMessages((prev) => [...prev, ...formattedMessages]);
        });

        newSocket.on("welcome", (msg: string) => {
            addMessage("", msg, false);
        });

        newSocket.on("user-connected", (msg: string) => {
            addMessage("", `🟢 ${msg}`, false);
        });

        newSocket.on("user-disconnected", (msg: string) => {
            addMessage("", `🔴 ${msg}`, false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [prefersDarkMode]);

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <Container sx={{ height: "100vh", width: "100vw", p: { xs: 0, md: 2 } }}>
                <AppBar position="static" color="inherit" elevation={1}>
                    <Toolbar>
                        {isMobile && (
                            <IconButton
                                color="inherit"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 2 }}
                            >
                                <IoMenu />
                            </IconButton>
                        )}
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                            IRC Project
                        </Typography>
                        {!isMobile && (
                            <>
                                <AccountModal
                                    isConnected={isConnected}
                                    setIsConnected={setIsConnected}
                                    setIsUsernameSet={setIsUsernameSet}
                                    setUsername={setUsername}
                                    socket={socket}
                                />
                                {!isConnected && <RegistrationModal />}
                            </>
                        )}
                        <IconButton onClick={toggleTheme} color="inherit">
                            {theme.palette.mode === "dark" ? <IoSunny /> : <IoMoon />}
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <StyledChatContainer>
                    {isMobile ? renderMobileMenu() : (
                        <SidePanel elevation={2}>
                            <ChannelsList isMobile={isMobile} handleDrawerToggle={handleDrawerToggle} />
                        </SidePanel>
                    )}
                    <ChatAreaChannel
                        messages={messages}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        handleSendMessage={handleSendMessage}
                        isUsernameSet={isUsernameSet}
                        isConnected={isConnected}
                        username={username}
                        setUsername={setUsername}
                        handleSetUsername={handleSetUsername}
                        formatDate={formatDate}
                    />
                    {isMobile ? renderMobileMenu() : (
                        <SidePanel elevation={2}>
                            <OnlineList isMobile={isMobile} handleDrawerToggle={handleDrawerToggle} />
                        </SidePanel>
                    )}
                </StyledChatContainer>
            </Container>
        </ThemeProvider>
    );
}

export default ChatBlock;
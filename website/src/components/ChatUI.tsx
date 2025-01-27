import {
    Box,
    TextField,
    Typography,
    Stack,
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
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { IoSend, IoMenu, IoMoon, IoSunny } from "react-icons/io5";
import StyledChatContainer from "./StyledChatContainer";
import SidePanel from "./SidePanel";
import ChatArea from "./ChatArea";
import MessageContainer from "./MessageContainer";
import MessageBubble from "./MessageBubble";
import AccountModal from "./AccountModal";
import { useEffect, useState } from 'react';
import { useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import RegistrationModal from "./RegistrationModal.tsx";
import { format } from 'date-fns';
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ChannelSettingsModal from "./ChannelSettingsModal.tsx";

const ChatUI = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<
        { user: string; text: string; sent: boolean; timestamp: string }[]
    >([]);
    const [inputValue, setInputValue] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const [mode, setMode] = useState<"light" | "dark">(prefersDarkMode ? "dark" : "light");

    const [username, setUsername] = useState<string>('');
    const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const handleSetUsername = () => {
        const trimmedUsername = username.trim();
        if (trimmedUsername && socket) {
            socket.emit('set-username', trimmedUsername);
            setIsUsernameSet(true);
            setIsConnected(false);
            console.log("Nom d'utilisateur défini:", trimmedUsername);
        } else {
            alert("Veuillez entrer un nom d'utilisateur.");
        }
    };

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

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({behavior: 'smooth'});
        }
    };

    const customTheme = createTheme({
        palette: {
            mode: mode,
        },
    });

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

    const dummyOnlines = [
        {
            id: 1,
            name: "John"
        },
        {
            id: 2,
            name: "Liane"
        },
        {
            id: 3,
            name: "Ethane"
        },
        {
            id: 4,
            name: "Alexy"
        },
        {
            id: 5,
            name: "Jean"
        },
        {
            id: 6,
            name: "Deyan"
        },
        {
            id: 7,
            name: "Mickael"
        },
    ];

    useEffect(() => {
        setMode(prefersDarkMode ? "dark" : "light");
    }, [prefersDarkMode]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
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
    }, []);

    const addMessage = (user: string, text: string, sent: boolean, timestamp?: string) => {
        setMessages((prev) => [...prev, {user, text, sent, timestamp: timestamp || ""}]);
    };

    const handleSendMessage = () => {
        if (inputValue && socket && isUsernameSet) {
            socket.emit("message", inputValue);
            addMessage(username, inputValue, true, new Date().toISOString());
            setInputValue("");
            console.log("Message envoyé:", inputValue);
        }
    };

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
                    <AccountModal />
                    <RegistrationModal />
                </SidePanel>
            </Box>
        </Drawer>
    );

    const chatsList = (
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

    const onlineList = (
        <>
            <Typography variant="body2" color="text.secondary">
                Online
            </Typography>
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
                            "&:hover": {backgroundColor: theme.palette.action.hover},
                        }}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <PersonIcon style={{fontSize: 20, paddingRight: '5px'}}/>
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

    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline />
            <Container sx={{ height: "100vh", width: "100vw", p: { xs: 0, md: 2 } }}>
                {/* Header */}
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
                                <AccountModal />
                                <RegistrationModal />
                            </>
                        )}

                        <IconButton onClick={toggleTheme} color="inherit">
                            {theme.palette.mode === "dark" ? <IoSunny /> : <IoMoon />}
                        </IconButton>

                    </Toolbar>
                </AppBar>

                {/* Chat Layout */}
                <StyledChatContainer>
                    {/* Side Panels */}
                    {isMobile ? renderMobileMenu() : (
                        <SidePanel elevation={2}>{chatsList}</SidePanel>
                    )}

                    {/* Chat Area */}
                    <ChatArea elevation={2}>
                        {/* Chat Header */}
                        <Box sx={{display: "flex", justifyContent: "space-between", mb: 2}}>
                            <Box sx={{display: "flex", alignItems: "center", gap: 2}}>
                                <Typography variant="h6">Chat Room</Typography>
                            </Box>

                            <ChannelSettingsModal />

                        </Box>

                        {/* Messages */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                                mb: 2,
                                p: 1,
                            }}
                        >
                            {messages.map((message, index) => (
                                <MessageContainer key={index}>
                                    <MessageBubble>
                                        <Typography variant="body1" fontWeight="bold" fontSize={"small"}
                                                    marginBottom={"3px"} display={"flex"} alignContent={"center"}>
                                            {message.user === "" ? (
                                                <span role="img" aria-label="robot">🤖</span>
                                            ) : (
                                                <PersonIcon style={{fontSize: 20, paddingRight: '3px' }} />
                                            )}
                                            {message.user}
                                        </Typography>
                                        <Typography variant="body1">
                                            {message.text}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                                        >
                                            {formatDate(message.timestamp)}
                                        </Typography>
                                    </MessageBubble>
                                </MessageContainer>
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* New Message Input */}
                        {isUsernameSet || isConnected ? (
                            <Box id="form" sx={{ display: "flex", gap: 1 }}>
                                <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} style={{ display: "flex", width: "100%" }}>
                                    <TextField
                                        id="input"
                                        fullWidth
                                        placeholder="Type a message"
                                        value={inputValue}
                                        autoComplete="off"
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    <IconButton
                                        id="sendButton"
                                        color="primary"
                                        aria-label="send message"
                                        onClick={handleSendMessage}
                                        type="submit"
                                    >
                                        <IoSend />
                                    </IconButton>
                                </form>
                            </Box>
                        ) : (
                            <Box id="username-container" sx={{ display: "flex", gap: 1 }}>
                                <form onSubmit={(e) => { e.preventDefault(); handleSetUsername(); }} style={{ display: "flex", width: "100%" }}>
                                    <TextField
                                        id="username"
                                        fullWidth
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Entrez votre nom d'utilisateur"
                                        autoComplete="off"
                                        value={username}
                                    />
                                    <IconButton
                                        id="set-username"
                                        color="primary"
                                        aria-label="define username"
                                        onClick={handleSetUsername}
                                        type="submit"
                                    >
                                        <IoSend />
                                    </IconButton>
                                </form>
                            </Box>
                        )}

                    </ChatArea>

                    {/* Online Users */}
                    {isMobile ? renderMobileMenu() : (
                        <SidePanel elevation={2}>{onlineList}</SidePanel>
                    )}

                </StyledChatContainer>

            </Container>
        </ThemeProvider>
    );
}

export default ChatUI;
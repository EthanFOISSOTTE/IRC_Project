import {
    Box,
    TextField,
    Typography,
    Stack,
    Container,
    IconButton,
    useTheme,
    ThemeProvider,
    createTheme,
    CssBaseline,
    useMediaQuery,
    Drawer,
    AppBar,
    Toolbar,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { IoSend, IoSettingsSharp, IoMenu, IoMoon, IoSunny } from "react-icons/io5";
import StyledChatContainer from "./StyledChatContainer";
import SidePanel from "./SidePanel";
import ChatArea from "./ChatArea";
import MessageContainer from "./MessageContainer";
import MessageBubble from "./MessageBubble";
import AccountModal from "./AccountModal";
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import RegistrationModal from "./RegistrationModal.tsx";

const ChatUI = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<
        { text: string; sent: boolean; timestamp: string }[]
    >([]);
    const [inputValue, setInputValue] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mode, setMode] = useState<"light" | "dark">("light");

    const [username, setUsername] = useState<string>('');
    const [isUsernameSet, setIsUsernameSet] = useState<boolean>(false);

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
    } else {
        alert("Veuillez entrer un nom d'utilisateur.");
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
            name: "Alexis"
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
        const newSocket = io(`ws://${window.location.hostname}:3000`, {
            withCredentials: true,
        });

        setSocket(newSocket);


        newSocket.on("welcome", (msg: string) => {
            addMessage(msg, false);
        });

        newSocket.on("message", (msg: { text: string; sent: boolean; timestamp: string }) => {
            addMessage(msg.text, msg.sent, msg.timestamp);
        });

        newSocket.on("previousMessages", (msgs: { text: string; sent: boolean; timestamp: string }[]) => {
            const formattedMessages = msgs.map((msg) => ({
                ...msg,
                sent: false,
            }));
            setMessages((prev) => [...prev, ...formattedMessages]);
        });

        newSocket.on("user-connected", (msg: string) => {
            addMessage(`🟢 ${msg}`, false);
        });

        newSocket.on("user-disconnected", (msg: string) => {
            addMessage(`🔴 ${msg}`, false);
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    const addMessage = (text: string, sent: boolean, timestamp: string = new Date().toLocaleTimeString()) => {
        setMessages((prev) => [...prev, { text, sent, timestamp }]);
    };

    const handleSendMessage = () => {
        if (inputValue && socket) {
            socket.emit("message", inputValue);
            setInputValue("");
        }
    };

    const chatsList = (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                    Channels
                </Typography>
                <AccountModal />
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
                            "&:hover": { backgroundColor: theme.palette.action.hover },
                        }}
                        onClick={() => isMobile && handleDrawerToggle()}
                    >
                        <ChatIcon style={{ fontSize: 40 }} />
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

                        <RegistrationModal />

                        <IconButton onClick={toggleTheme} color="inherit">
                            {theme.palette.mode === "dark" ? <IoSunny /> : <IoMoon />}
                        </IconButton>

                    </Toolbar>
                </AppBar>

                {/* Chat Layout */}
                <StyledChatContainer>
                    {/* Side Panels */}
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            anchor="left"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{ "& .MuiDrawer-paper": { width: "80%" } }}
                        >
                            <Box sx={{ p: 2 }}>
                                <SidePanel>{chatsList}</SidePanel>
                            </Box>
                        </Drawer>
                    ) : (
                        <SidePanel elevation={2}>{chatsList}</SidePanel>
                    )}

                    {/* Chat Area */}
                    <ChatArea elevation={2}>
                        {/* Chat Header */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="h6">Chat Room</Typography>
                            </Box>
                            <IconButton aria-label="settings">
                                <IoSettingsSharp />
                            </IconButton>
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
                                <MessageContainer key={index} sent={message.sent}>
                                    <MessageBubble sent={message.sent}>
                                        <Typography variant="body1">{message.text}</Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ display: "block", mt: 0.5, opacity: 0.7 }}
                                        >
                                            {message.timestamp}
                                        </Typography>
                                    </MessageBubble>
                                </MessageContainer>
                            ))}
                        </Box>

                        {/* New Message Input */}

                        {!isUsernameSet ? (
                            <Box id="username-container" sx={{display: "flex", gap: 1}}>
                                <TextField
                                    id="username"
                                    fullWidth
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Entrez votre nom d'utilisateur"
                                    value={username}
                                />
                                <IconButton
                                    id="set-username"
                                    color="primary"
                                    aria-label="define username"
                                    onClick={handleSetUsername}
                                >
                                    <IoSend/>
                                </IconButton>
                            </Box>
                        ) : (
                            <Box id="form" sx={{display: "flex", gap: 1}}>
                                <TextField
                                    id="input"
                                    fullWidth
                                    placeholder="Type a message"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                />
                                <IconButton
                                    id="sendButton"
                                    color="primary"
                                    aria-label="send message"
                                    onClick={handleSendMessage}
                                >
                                    <IoSend />
                                </IconButton>
                            </Box>
                        )}

                    </ChatArea>

                    {/* Online Users */}
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            anchor="left"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{ "& .MuiDrawer-paper": { width: "80%" } }}
                        >
                            <Box sx={{ p: 2 }}>
                                <SidePanel>{onlineList}</SidePanel>
                            </Box>
                        </Drawer>
                    ) : (
                        <SidePanel elevation={2}>{onlineList}</SidePanel>
                    )}
                </StyledChatContainer>

            </Container>
        </ThemeProvider>
    );
};

export default ChatUI;
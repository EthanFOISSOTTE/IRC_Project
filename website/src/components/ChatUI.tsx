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
import {useEffect, useState} from "react";
import StyledChatContainer from "./StyledChatContainer.tsx";
import SidePanel from "./SidePanel.tsx";
import ChatArea from "./ChatArea.tsx";
import MessageContainer from "./MessageContainer.tsx";
import MessageBubble from "./MessageBubble.tsx";
import AccountModal from "./AccountModal.tsx";

const ChatUI = () => {
    const [messages, setMessages] = useState<{ id: number; text: string; sent: boolean; timestamp: string; }[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mode, setMode] = useState<"light" | "dark">("light");

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
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

    const dummyMessages = [
        { id: 1, text: "Hi there!", sent: false, timestamp: "09:00 AM" },
        { id: 2, text: "Hello! How are you?", sent: true, timestamp: "09:01 AM" },
        {
            id: 3,
            text: "I'm doing great, thanks for asking!",
            sent: false,
            timestamp: "09:02 AM",
        },
    ];

    useEffect(() => {
        setMessages(dummyMessages);
    }, []);

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const newMsg = {
                id: messages.length + 1,
                text: newMessage,
                sent: true,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages([...messages, newMsg]);
            setNewMessage("");
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const chatsList = (
        <>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2" color="text.secondary">
                    Chats
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
                        <IconButton onClick={toggleTheme} color="inherit">
                            {mode === "dark" ? <IoSunny /> : <IoMoon />}
                        </IconButton>
                    </Toolbar>
                </AppBar>

                <StyledChatContainer>
                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            anchor="left"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{ "& .MuiDrawer-paper": { width: "80%" } }}
                        >
                            <Box sx={{ p: 2 }}>{chatsList}</Box>
                        </Drawer>
                    ) : (
                        <SidePanel elevation={2}>{chatsList}</SidePanel>
                    )}

                    <ChatArea elevation={2}>

                        {/* Entete de la conversation */}
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <Typography variant="h6">Chat 1</Typography>
                            </Box>

                            <IconButton aria-label="settings">
                                <IoSettingsSharp />
                            </IconButton>
                        </Box>

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
                            {messages.map((message) => (
                                <MessageContainer key={message.id} sent={message.sent}>
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

                        <Box sx={{ display: "flex", gap: 1 }}>
                            <TextField
                                fullWidth
                                placeholder="Type a message"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                            />
                            <IconButton
                                color="primary"
                                onClick={handleSendMessage}
                                aria-label="send message"
                            >
                                <IoSend />
                            </IconButton>
                        </Box>
                    </ChatArea>

                    {isMobile ? (
                        <Drawer
                            variant="temporary"
                            anchor="left"
                            open={mobileOpen}
                            onClose={handleDrawerToggle}
                            ModalProps={{ keepMounted: true }}
                            sx={{ "& .MuiDrawer-paper": { width: "80%" } }}
                        >
                            <Box sx={{ p: 2 }}>{onlineList}</Box>
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
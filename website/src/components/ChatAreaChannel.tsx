import React, { useRef, useEffect } from 'react';
import { TextField, Typography, IconButton, Box } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import { IoSend } from "react-icons/io5";
import MessageContainer from "./MessageContainer";
import MessageBubble from "./MessageBubble";
import ChannelSettingsModal from "./ChannelSettingsModal.tsx";
import ChatArea from "./ChatArea";

interface ChatAreaChannelProps {
    messages: { user: string; text: string; sent: boolean; timestamp: string }[];
    inputValue: string;
    setInputValue: (value: string) => void;
    handleSendMessage: () => void;
    isUsernameSet: boolean;
    isConnected: boolean;
    onlineUsers: string[];
    username: string;
    setUsername: (value: string) => void;
    handleSetUsername: () => void;
    formatDate: (dateString: string) => string;
}

const ChatAreaChannel: React.FC<ChatAreaChannelProps> = ({
                                                             messages,
                                                             inputValue,
                                                             setInputValue,
                                                             handleSendMessage,
                                                             isUsernameSet,
                                                             isConnected,
                                                             onlineUsers,
                                                             username,
                                                             setUsername,
                                                             handleSetUsername,
                                                             formatDate
                                                         }) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <ChatArea>
            {/* Chat Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6">Chat Room</Typography>
                </Box>
                <ChannelSettingsModal onlineUsers={onlineUsers} />
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
                                    <PersonIcon style={{ fontSize: 20, paddingRight: '3px' }} />
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
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSendMessage();
                    }} style={{ display: "flex", width: "100%" }}>
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
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSetUsername();
                    }} style={{ display: "flex", width: "100%" }}>
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
    );
};

export default ChatAreaChannel;
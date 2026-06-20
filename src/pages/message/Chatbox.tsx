import { useState, useRef, useEffect } from "react";
import { Avatar, Box, IconButton, TextField, Tooltip, Typography } from "@mui/material";
import CloseIcon              from "@mui/icons-material/Close";
import MinimizeIcon           from "@mui/icons-material/Remove";
import SendIcon               from "@mui/icons-material/Send";
import OpenInFullIcon         from "@mui/icons-material/OpenInFull";
import { useMessages }        from "../context/MessagesContext";
import type { OpenChat }      from "../context/MessagesContext";

// ── Avatar color ──────────────────────────────────────────────────────────────

function avatarColor(letter: string) {
    const palette = [
        "rgba(47,124,201,0.9)", "rgba(99,102,241,0.9)",
        "rgba(16,185,129,0.9)", "rgba(245,158,11,0.9)",
        "rgba(239,68,68,0.9)",  "rgba(236,72,153,0.9)",
    ];
    return palette[letter.charCodeAt(0) % palette.length];
}

// ── Single chat window ────────────────────────────────────────────────────────

function ChatWindow({ chat }: { chat: OpenChat }) {
    const { closeChat, toggleMinimize, sendMessage } = useMessages();
    const [input,    setInput]    = useState("");
    const messagesEndRef          = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chat.minimized) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [chat.messages, chat.minimized]);

    const handleSend = async () => {
        if (!input.trim()) return;
        await sendMessage(chat.id, input.trim());
        setInput("");
    };

    return (
        <Box sx={{
            width: 280,
            display: "flex", flexDirection: "column",
            bgcolor: "rgba(7,24,55,0.98)",
            border: "1px solid rgba(147,181,218,0.2)",
            borderRadius: "10px 10px 0 0",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.4)",
            overflow: "hidden",
            animation: "slideUp 0.2s cubic-bezier(0.16,1,0.3,1)",
            "@keyframes slideUp": {
                from: { transform: "translateY(100%)", opacity: 0 },
                to:   { transform: "translateY(0)",    opacity: 1 },
            },
        }}>
            {/* Header */}
            <Box
                onClick={() => toggleMinimize(chat.id)}
                sx={{
                    px: 1.5, py: 1,
                    bgcolor: "rgba(47,124,201,0.18)",
                    borderBottom: chat.minimized ? "none" : "1px solid rgba(147,181,218,0.12)",
                    display: "flex", alignItems: "center", gap: 1,
                    cursor: "pointer",
                    "&:hover": { bgcolor: "rgba(47,124,201,0.25)" },
                    transition: "background 0.15s",
                }}
            >
                <Avatar sx={{
                    width: 28, height: 28, fontSize: "0.72rem", fontWeight: 700, flexShrink: 0,
                    bgcolor: avatarColor(chat.avatar),
                }}>
                    {chat.avatar}
                </Avatar>
                <Typography variant="body2" fontWeight={700} sx={{ flex: 1, fontSize: "0.8rem", lineHeight: 1.2 }}>
                    {chat.providerName}
                </Typography>
                <Tooltip title={chat.minimized ? "Agrandir" : "Réduire"}>
                    <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}
                                onClick={(e) => { e.stopPropagation(); toggleMinimize(chat.id); }}>
                        {chat.minimized
                            ? <OpenInFullIcon sx={{ fontSize: 13 }} />
                            : <MinimizeIcon  sx={{ fontSize: 13 }} />
                        }
                    </IconButton>
                </Tooltip>
                <Tooltip title="Fermer">
                    <IconButton size="small" sx={{ color: "text.secondary", p: 0.25 }}
                                onClick={(e) => { e.stopPropagation(); closeChat(chat.id); }}>
                        <CloseIcon sx={{ fontSize: 13 }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Messages area — hidden when minimized */}
            {!chat.minimized && (
                <>
                    <Box sx={{
                        flex: 1, overflowY: "auto", p: 1.25,
                        display: "flex", flexDirection: "column", gap: 0.75,
                        maxHeight: 260, minHeight: 180,
                        "&::-webkit-scrollbar": { width: 3 },
                        "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(148,163,184,0.2)", borderRadius: 10 },
                    }}>
                        {chat.messages.length === 0 ? (
                            <Typography sx={{ fontSize: "0.72rem", color: "text.disabled", textAlign: "center", mt: 2, fontStyle: "italic" }}>
                                Démarrez la conversation...
                            </Typography>
                        ) : chat.messages.map((msg, i) => {
                            const isAdmin = msg.from === "admin";
                            return (
                                <Box key={i} sx={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start" }}>
                                    <Box sx={{
                                        maxWidth: "80%", px: 1.25, py: 0.75, borderRadius: isAdmin ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                                        bgcolor: isAdmin ? "rgba(47,124,201,0.25)" : "rgba(255,255,255,0.07)",
                                        border: `1px solid ${isAdmin ? "rgba(47,124,201,0.3)" : "rgba(147,181,218,0.12)"}`,
                                    }}>
                                        <Typography sx={{ fontSize: "0.78rem", lineHeight: 1.5, color: "text.primary", wordBreak: "break-word" }}>
                                            {msg.text}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.6rem", color: "text.disabled", mt: 0.25, textAlign: isAdmin ? "right" : "left" }}>
                                            {msg.time}{isAdmin ? (msg.read ? " • Seen" : " • Sent") : ""}
                                        </Typography>

                                    </Box>
                                </Box>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input */}
                    <Box sx={{
                        px: 1, py: 0.75,
                        borderTop: "1px solid rgba(147,181,218,0.1)",
                        display: "flex", gap: 0.75, alignItems: "center",
                    }}>
                        <TextField
                            placeholder={chat.readonly ? "Conversation en lecture seule" : chat.sending ? "Envoi en cours..." : "Message..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void handleSend(); } }}
                            size="small" fullWidth multiline maxRows={3}
                            disabled={chat.readonly || chat.sending}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    bgcolor: "rgba(0,0,0,0.2)", fontSize: "0.78rem",
                                    "& fieldset": { borderColor: "rgba(147,181,218,0.15)" },
                                    "&:hover fieldset": { borderColor: "rgba(147,181,218,0.3)" },
                                    "& textarea": { padding: "6px 8px" },
                                },
                            }}
                        />
                        <IconButton
                            size="small"
                            disabled={!input.trim() || chat.readonly || chat.sending}
                            onClick={() => { void handleSend(); }}
                            sx={{
                                color: input.trim() ? "primary.light" : "text.disabled",
                                bgcolor: input.trim() ? "rgba(47,124,201,0.15)" : "transparent",
                                borderRadius: 1.5, p: 0.75, flexShrink: 0,
                                transition: "all 0.15s",
                            }}
                        >
                            <SendIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                    </Box>
                </>
            )}
        </Box>
    );
}

// ── Chat stack container ──────────────────────────────────────────────────────

export default function ChatBoxStack() {
    const { openChats } = useMessages();

    if (openChats.length === 0) return null;

    return (
        <Box sx={{
            position: "fixed",
            bottom: 0,
            right: 24,
            zIndex: 1300,
            display: "flex",
            alignItems: "flex-end",
            gap: 1.5,
        }}>
            {openChats.map((chat) => (
                <ChatWindow key={chat.id} chat={chat} />
            ))}
        </Box>
    );
}

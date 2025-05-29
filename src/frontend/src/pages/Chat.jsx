import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import { backend } from 'declarations/backend';

const dummyMessages = [
    { id: 1, from: "bot", text: "Hi, how can I help you today?", timestamp: new Date() },
];

function formatTime(date) {
    if (!date || isNaN(new Date(date).getTime())) return "";
    return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function Chat() {
    const [messages, setMessages] = useState(dummyMessages);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const savedMessages = localStorage.getItem("chatMessages");
        if (savedMessages) {
            try {
                setMessages(JSON.parse(savedMessages));
            } catch (err) {
                console.error("Failed to parse saved chat:", err);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }, [messages]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

        // Disable body scroll
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = ""; // reset on unmount
        };
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input.trim();
        const userMessage = {
            id: messages.length + 1,
            from: "user",
            text: userText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");

        const typingMessage = {
            id: messages.length + 2,
            from: "bot",
            text: "Moodie is typing...",
            typing: true,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, typingMessage]);

        try {
            const conversationHistory = messages
                .slice(-15)
                .map(m => `${m.from === "user" ? "User" : "Bot"}: ${m.text}`)
                .join("\n") + `\nUser: ${userText}`;

            const botResponse = await backend.prompt(conversationHistory);

            const botMessage = {
                id: messages.length + 3,
                from: "bot",
                text: botResponse,
                timestamp: new Date(),
            };

            setMessages((prev) => [
                ...prev.filter((m) => !m.typing),
                botMessage,
            ]);
        } catch (error) {
            const errorMessage = {
                id: messages.length + 2,
                from: "bot",
                text: "Sorry, I couldn't respond at the moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [
                ...prev.filter((m) => !m.typing),
                errorMessage,
            ]);
            console.error("AI error:", error);
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] pt-4 pb-18 w-full bg-white">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm flex flex-col ${msg.from === "bot"
                            ? "bg-white text-gray-900 self-start"
                            : "bg-green-500 text-white self-end ml-auto"
                            }`}
                    >
                        {/* Text typing */}
                        {msg.typing ? (
                            <div className="italic text-gray-400">{msg.text}</div>
                        ) : (
                            msg.text.split("\n").map((line, i) => <p key={i}>{line}</p>)
                        )}
                        {/* Timestamp */}
                        <span
                            className={`text-[10px] mt-1 ${msg.from === "bot"
                                ? "text-gray-400 self-start"
                                : "text-white/70 self-end"
                                }`}
                        >
                            {formatTime(msg.timestamp)}
                        </span>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div className="p-3 border-t bg-white flex items-center gap-2">
                <Input
                    className="flex-grow rounded-full"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <Button
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="rounded-full bg-green-500 hover:bg-green-600 text-white"
                >
                    <SendHorizonal className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

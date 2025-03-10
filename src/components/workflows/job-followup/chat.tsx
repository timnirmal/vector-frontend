"use client";

import React, { useState, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { ChatMessage, CompatibilityResponse } from "./index";

interface ChatStepProps {
    chatMessages: ChatMessage[];
    setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    analysis: CompatibilityResponse | null;
}

export default function ChatStep({
                                     chatMessages,
                                     setChatMessages,
                                     analysis,
                                 }: ChatStepProps) {
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [chatEnded, setChatEnded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasFetchedFirstQuestion = useRef(false);

    // Auto-scroll to the bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

    // Fetch the first question from the backend on mount
    useEffect(() => {
        if (hasFetchedFirstQuestion.current) return;
        hasFetchedFirstQuestion.current = true;

        const fetchFirstQuestion = async () => {
            try {
                const response = await fetch("https://api.know360.io/job_followup_agent/get-first-question", {
                    method: "POST",
                });
                if (!response.ok) {
                    throw new Error("Failed to fetch first question");
                }
                const data = await response.json();
                // Assuming the endpoint returns the question text directly
                const agentMessage: ChatMessage = {
                    sender: "agent",
                    content: data,
                    timestamp: new Date(),
                };
                setChatMessages((prev) => [...prev, agentMessage]);
            } catch (error) {
                console.error("Error fetching first question:", error);
                toast.error("Error fetching first question");
            }
        };

        fetchFirstQuestion();
    }, [setChatMessages]);

    const sendMessage = async () => {
        if (!newMessage.trim() || chatEnded) return;

        // Add user's message to the chat
        const userMessage: ChatMessage = {
            sender: "user",
            content: newMessage,
            timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, userMessage]);
        setNewMessage("");
        setIsLoading(true);

        try {
            // Call the conduct-interview endpoint with the user's answer
            const response = await fetch("https://api.know360.io/job_followup_agent/conduct-interview", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answer: userMessage.content }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const data = await response.json();

            // Add agent's response to the chat history
            const agentMessage: ChatMessage = {
                sender: "agent",
                content: data.next_message || "",
                timestamp: new Date(),
            };
            setChatMessages((prev) => [...prev, agentMessage]);

            // If the response indicates the interview has ended, prevent further input
            if (data.status === "END") {
                setChatEnded(true);
                toast.success("Interview has ended.");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (date: Date) =>
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return (
        <div className="space-y-4 py-4">
            <h2 className="text-xl font-semibold">Chat with Job Assistant</h2>
            <p className="text-muted-foreground">
                Ask questions about the job or get advice on improving your application.
            </p>

            <div className="border rounded-md bg-background">
                <ScrollArea className="h-[400px] p-4">
                    <div className="space-y-4">
                        {chatMessages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    message.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${
                                        message.sender === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {message.sender === "agent" && (
                                            <MessageSquare className="h-4 w-4" />
                                        )}
                                        <span className="text-xs font-medium">
                      {message.sender === "user" ? "You" : "Assistant"}
                    </span>
                                        <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                                    </div>
                                    <p className="whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="max-w-[80%] rounded-lg p-3 bg-secondary">
                                    <div className="flex items-center gap-2 mb-1">
                                        <MessageSquare className="h-4 w-4" />
                                        <span className="text-xs font-medium">Assistant</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75"></div>
                                        <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>

                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Type your message..."
                            className="min-h-[60px] flex-1"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading || chatEnded}
                        />
                        <Button
                            onClick={sendMessage}
                            disabled={!newMessage.trim() || isLoading || chatEnded}
                            className="self-end"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/*/!* Suggested questions based on analysis *!/*/}
            {/*{analysis && (*/}
            {/*    <div className="bg-secondary/50 p-4 rounded-md">*/}
            {/*        <h3 className="text-sm font-medium mb-2">Suggested Questions:</h3>*/}
            {/*        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">*/}
            {/*            {analysis.questions.situational.slice(0, 2).map((q, i) => (*/}
            {/*                <Button*/}
            {/*                    key={`sit-${i}`}*/}
            {/*                    variant="outline"*/}
            {/*                    className="justify-start h-auto py-2 px-3 text-left text-xs"*/}
            {/*                    onClick={() => setNewMessage(q)}*/}
            {/*                >*/}
            {/*                    {q}*/}
            {/*                </Button>*/}
            {/*            ))}*/}
            {/*            {analysis.questions.cultural_fit.slice(0, 2).map((q, i) => (*/}
            {/*                <Button*/}
            {/*                    key={`cf-${i}`}*/}
            {/*                    variant="outline"*/}
            {/*                    className="justify-start h-auto py-2 px-3 text-left text-xs"*/}
            {/*                    onClick={() => setNewMessage(q)}*/}
            {/*                >*/}
            {/*                    {q}*/}
            {/*                </Button>*/}
            {/*            ))}*/}
            {/*        </div>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
}

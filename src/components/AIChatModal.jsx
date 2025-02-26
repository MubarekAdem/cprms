"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function AIChatModal({ patientData, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]); // Updated dependency to chatHistory

  const sendMessage = async () => {
    if (!message.trim() && !customPrompt) return;
    setLoading(true);

    const promptMessage = customPrompt || message;
    const newMessage = { role: "doctor", text: promptMessage };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setCustomPrompt(null);

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptMessage,
          patientData: {
            ...patientData,
            medicalRecords: patientData.medicalRecords || [],
          },
        }),
      });

      const data = await response.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleSummarize = () => {
    setCustomPrompt(
      "Summarize the patient's medical records and provide a concise overview."
    );
    sendMessage();
  };

  const handleRecommendation = () => {
    setCustomPrompt(
      "Based on the patient's medical records, provide treatment recommendations."
    );
    sendMessage();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <Card className="w-full h-[600px] flex flex-col">
          <CardHeader>
            <DialogTitle className="text-2xl font-bold">
              Chat with AI Assistant - {patientData.name}
            </DialogTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="flex space-x-4 mb-4">
              <Button onClick={handleSummarize} variant="secondary">
                Summarize
              </Button>
              <Button onClick={handleRecommendation} variant="secondary">
                Recommendation
              </Button>
            </div>
            <ScrollArea className="h-[400px] pr-4" ref={chatContainerRef}>
              {chatHistory.map((msg, index) => (
                <div
                  key={index}
                  className={`flex items-start space-x-2 mb-4 ${
                    msg.role === "doctor" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "ai" && (
                    <Avatar>
                      <AvatarFallback>AI</AvatarFallback>
                      <AvatarImage src="/ai-avatar.png" />
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      msg.role === "doctor"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === "doctor" && (
                    <Avatar>
                      <AvatarFallback>Dr</AvatarFallback>
                      <AvatarImage src="/doctor-avatar.png" />
                    </Avatar>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask AI about the patient..."
              />
              <Button onClick={sendMessage} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

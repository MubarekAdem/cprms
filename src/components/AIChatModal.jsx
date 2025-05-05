"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function AIChatModal({ patientData, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState(null);
  const chatContainerRef = useRef(null);

  // Scroll to bottom when chat history updates
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to send message: ${response.status}, ${errorText}`
        );
      }

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
      toast.error("Error communicating with AI: " + error.message);
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
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <Card className="border-none shadow-md w-full h-[500px] flex flex-col overflow-hidden">
          <CardHeader>
            <DialogTitle className="text-xl font-bold">
              AI Assistant - {patientData.name}
            </DialogTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden">
            <div className="flex space-x-4 mb-4">
              <Button
                onClick={handleSummarize}
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
              >
                Summarize
              </Button>
              <Button
                onClick={handleRecommendation}
                variant="outline"
                className="bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
              >
                Recommendation
              </Button>
            </div>
            <ScrollArea
              className="h-[300px] pr-4 bg-gray-50 dark:bg-gray-900"
              ref={chatContainerRef}
            >
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <p>Start a conversation with the AI assistant.</p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-start space-x-2 mb-4 ${
                      msg.role === "doctor" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-center space-x-2 max-w-[80%] ${
                        msg.role === "doctor" ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Badge
                        variant="outline"
                        className={`${
                          msg.role === "doctor"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {msg.role === "doctor" ? "Dr" : "AI"}
                      </Badge>
                      <div
                        className={`rounded-lg p-3 ${
                          msg.role === "doctor"
                            ? "bg-blue-500 text-white dark:bg-blue-600"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 dark:text-blue-300" />
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex items-center space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI about the patient..."
              className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            />
            <Button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

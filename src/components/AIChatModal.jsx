import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AIChatModal({ patientData, onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    setLoading(true);

    const newMessage = { role: "doctor", text: message };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");

    try {
      const response = await fetch("/api/chat-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[500px] bg-white"
        aria-labelledby="chat-ai-modal-title"
        aria-describedby="chat-ai-modal-description"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Chat with AI Assistant - {patientData.name}
          </DialogTitle>
        </DialogHeader>
        <div
          ref={chatContainerRef}
          className="h-[400px] overflow-y-auto border border-gray-300 rounded-md p-4 mb-4 space-y-4"
        >
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "doctor" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === "doctor"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-black"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                <Loader2 className="w-5 h-5 animate-spin text-green-500" />
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Input
            className="flex-grow border-2 border-black focus:ring-2 focus:ring-green-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask AI about the patient..."
          />
          <Button
            onClick={sendMessage}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

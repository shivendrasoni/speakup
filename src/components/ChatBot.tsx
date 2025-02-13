
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, X, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your navigation assistant. How can I help you today?",
      isBot: true
    }
  ]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      isBot: false
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");

    // Simple response logic
    let botResponse = {
      id: (Date.now() + 1).toString(),
      isBot: true,
      text: ""
    };

    const lowerInput = input.toLowerCase();
    if (lowerInput.includes("complaint") || lowerInput.includes("voice") || lowerInput.includes("concern")) {
      botResponse.text = "You can submit a complaint by visiting our Voice Your Concerns page. Would you like me to take you there?";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/complaints/new"), 2000);
    } else if (lowerInput.includes("community") || lowerInput.includes("forum")) {
      botResponse.text = "Our community forum is a great place to connect with others. Let me take you there.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/community"), 2000);
    } else if (lowerInput.includes("language") || lowerInput.includes("translate")) {
      botResponse.text = "You can change the language using the language selector button in the navigation bar.";
      setMessages(prev => [...prev, botResponse]);
    } else if (lowerInput.includes("help") || lowerInput.includes("assistance")) {
      botResponse.text = "I can help you navigate the platform. You can ask about submitting complaints, accessing the community forum, changing language, or any other feature.";
      setMessages(prev => [...prev, botResponse]);
    } else {
      botResponse.text = "I'm here to help you navigate the platform. You can ask about submitting complaints, accessing the community forum, or changing language settings.";
      setMessages(prev => [...prev, botResponse]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-[350px] h-[500px] flex flex-col shadow-xl">
          <div className="p-4 border-b flex justify-between items-center bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Navigation Assistant</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/90"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.isBot
                        ? 'bg-muted text-muted-foreground'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button size="icon" onClick={handleSend}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Button
          className="rounded-full h-12 w-12 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}

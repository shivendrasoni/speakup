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
      text: "Hello! I'm your navigation assistant. How can I help you today? You can ask me about:\n- Submitting complaints\n- Community forum\n- Dashboard\n- Resources\n- Login/Signup\n- Language settings",
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

    // Enhanced response logic
    let botResponse = {
      id: (Date.now() + 1).toString(),
      isBot: true,
      text: ""
    };

    const lowerInput = input.toLowerCase();

    // Navigation logic
    if (lowerInput.includes("complaint") || lowerInput.includes("voice") || lowerInput.includes("concern")) {
      botResponse.text = "You can submit a new complaint, feedback, or compliment through our Voice Your Concerns page. Would you like me to take you there?";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/"), 2000);
    } 
    else if (lowerInput.includes("dashboard") || lowerInput.includes("overview")) {
      botResponse.text = "I'll take you to the dashboard where you can view all complaints and their status.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/dashboard"), 2000);
    }
    else if (lowerInput.includes("community") || lowerInput.includes("forum") || lowerInput.includes("discuss")) {
      botResponse.text = "The community forum is where you can connect with others and share experiences. Let me show you.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/community"), 2000);
    }
    else if (lowerInput.includes("help") || lowerInput.includes("support") || lowerInput.includes("assistance")) {
      botResponse.text = "I'll take you to our help center where you can find guides and FAQs.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/help"), 2000);
    }
    else if (lowerInput.includes("login") || lowerInput.includes("sign in")) {
      botResponse.text = "I'll direct you to the login page.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/login"), 2000);
    }
    else if (lowerInput.includes("signup") || lowerInput.includes("register") || lowerInput.includes("create account")) {
      botResponse.text = "Let me take you to the signup page to create your account.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/signup"), 2000);
    }
    else if (lowerInput.includes("language") || lowerInput.includes("translate")) {
      botResponse.text = "You can change the language using the language selector button in the navigation bar. Look for the globe icon at the top of the page.";
      setMessages(prev => [...prev, botResponse]);
    }
    else if (lowerInput.includes("home") || lowerInput.includes("main page")) {
      botResponse.text = "I'll take you to the home page.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/"), 2000);
    }
    else if (lowerInput.includes("thank")) {
      botResponse.text = "You're welcome! Is there anything else I can help you with?";
      setMessages(prev => [...prev, botResponse]);
    }
    else if (lowerInput.includes("all complaints") || lowerInput.includes("view complaints")) {
      botResponse.text = "I'll show you the complaints dashboard where you can view all complaints.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/complaints"), 2000);
    }
    else if (lowerInput.includes("success") || lowerInput.includes("stories")) {
      botResponse.text = "Let me show you our success stories section in the community.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/community?tab=success_stories"), 2000);
    }
    else if (lowerInput.includes("peer") || lowerInput.includes("support group")) {
      botResponse.text = "I'll take you to our peer support section where you can connect with others.";
      setMessages(prev => [...prev, botResponse]);
      setTimeout(() => navigate("/community?tab=peer_support"), 2000);
    }
    else {
      botResponse.text = "I can help you navigate the platform. You can ask about:\n- Submitting complaints\n- Viewing the dashboard\n- Community forum\n- Success stories\n- Peer support\n- Login/Signup\n- Language settings\n\nWhat would you like to know more about?";
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
                    {message.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
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

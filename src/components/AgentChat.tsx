import React, { useState, useRef, useEffect } from "react";
import { Send, X, Loader2, RotateCcw, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  getOrCreateSession, 
  sendStreamingMessage, 
  getStoredMessages, 
  clearSession,
  storeMessage,
  type AgentMessage 
} from "@/utils/agentforceApi";
import { ToolOutputCard } from "@/components/ToolOutputCard";
import { AudioRecorder } from "@/components/AudioRecorder";
import { useToast } from "@/hooks/use-toast";

interface AgentChatProps {
  agent: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  isOpen: boolean;
  onClose: () => void;
}

export const AgentChat: React.FC<AgentChatProps> = ({ agent, isOpen, onClose }) => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [width, setWidth] = useState<number>(640); // Default width
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle resize functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;
    
    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = startWidth - (e.clientX - startX);
      const minWidth = 320;
      const maxWidth = 800;
      setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Initialize session and load messages when agent changes or chat opens
  useEffect(() => {
    if (isOpen && agent.id) {
      // Clear messages state first to prevent duplicates
      setMessages([]);
      setStreamingMessage("");
      setProgressMessage("");
      setIsStreaming(false);
      initializeChat();
    }
  }, [isOpen, agent.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      setIsInitializing(true);
      console.log(`[DEBUG] Initializing chat for agent ${agent.id}`);
      
      // Load stored messages first
      const storedMessages = getStoredMessages(agent.id);
      console.log(`[DEBUG] Setting ${storedMessages.length} stored messages in state`);
      setMessages(storedMessages);
      
      // Get or create session
      const session = await getOrCreateSession(agent.id);
      setSessionId(session.sessionId);
      
      // If no messages, show welcome message
      if (storedMessages.length === 0) {
        console.log(`[DEBUG] No stored messages, creating welcome message`);
        const welcomeMessage: AgentMessage = {
          id: `welcome-${agent.id}-${Date.now()}`, // Make ID more unique
          content: `Hello! I'm ${agent.title}. ${agent.description} How can I help you today?`,
          isUser: false,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        // Store the welcome message in localStorage
        storeMessage(agent.id, welcomeMessage);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to the agent. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() === "" || !sessionId || isLoading || isStreaming) return;
    
    const messageText = input.trim();
    setInput("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage("");
    setProgressMessage("");
    
    try {
      // Add user message immediately
      const userMessage: AgentMessage = {
        id: `user-${agent.id}-${Date.now()}-${Math.random()}`, // More unique ID
        content: messageText,
        isUser: true,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      storeMessage(agent.id, userMessage);
      
      // Send streaming message
      await sendStreamingMessage(agent.id, sessionId, messageText, {
        onProgress: (message) => {
          setProgressMessage(message);
        },
        onTextChunk: (chunk, offset) => {
          console.log('Received text chunk:', { chunk, offset }); // Debug log
          setStreamingMessage(prev => {
            const newMessage = offset === 0 ? chunk : prev + chunk;
            console.log('Updated streaming message:', newMessage); // Debug log
            return newMessage;
          });
          // Ensure we're in streaming mode
          if (!isStreaming) {
            setIsStreaming(true);
          }
        },
        onInform: (agentMessage) => {
          console.log(`[DEBUG] onInform called with message:`, {id: agentMessage.id, content: agentMessage.content.slice(0, 50), isUser: agentMessage.isUser});
          // Final message received, add to messages
          setMessages(prev => [...prev, agentMessage]);
          storeMessage(agent.id, agentMessage);
        },
        onEndOfTurn: () => {
          // Clear streaming state only when turn is completely done
          setIsStreaming(false);
          setStreamingMessage("");
          setProgressMessage("");
        },
        onValidationFailure: () => {
          // Clear previous chunks on validation failure
          setStreamingMessage("");
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          toast({
            title: "Message Error",
            description: error || "Failed to send message. Please try again.",
            variant: "destructive",
          });
          setStreamingMessage("");
          setProgressMessage("");
        }
      });
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to send message. Please try again.";

      // If session expired, prompt user to start new session
      if (errorMessage.includes("Session expired")) {
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please click 'Start New Session' to continue.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Message Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      // Don't clear streaming state here - let onEndOfTurn handle it
    }
  };

  const handleNewSession = async () => {
    try {
      setIsInitializing(true);
      clearSession(agent.id);
      setMessages([]);
      setSessionId(null);
      await initializeChat();
      
      toast({
        title: "New Session Started",
        description: "Started a fresh conversation with the agent.",
      });
    } catch (error) {
      console.error('Error starting new session:', error);
      toast({
        title: "Session Error",
        description: "Failed to start new session. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={cn(
        "fixed right-0 top-0 h-full bg-gradient-to-br from-card to-card/95 shadow-2xl border-l border-border z-50 flex",
        "transform transition-transform duration-300 ease-in-out",
        !isResizing && "transition-transform",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        className={cn(
          "w-1 bg-border hover:bg-primary/50 cursor-col-resize flex-shrink-0 transition-colors",
          isResizing && "bg-primary/50"
        )}
        onMouseDown={handleMouseDown}
      />
      
      {/* Chat content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-primary p-4 border-b border-primary/20 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
              {agent.icon}
            </div>
            <div className="text-white">
              <h2 className="font-semibold text-lg truncate">{agent.title}</h2>
              <p className="text-white/80 text-xs">AI Agent</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNewSession}
              disabled={isInitializing}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
              title="Start new session"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Messages container */}
        <div className="flex-1 h-[calc(100vh-180px)] overflow-y-auto p-4 bg-background/50">
          {isInitializing ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Connecting to agent...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-foreground text-lg mb-2">Start Conversation</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Send a message to begin chatting with {agent.title}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn("flex", msg.isUser ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] p-3 rounded-2xl",
                      msg.isUser
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-muted-foreground rounded-bl-sm border border-border"
                    )}
                  >
                    <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:bg-background [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:bg-muted/50 [&_th]:font-semibold [&_th]:text-left [&_th]:text-foreground [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-foreground [&_thead]:bg-muted/30">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                    {/* Render tool outputs if available */}
                    {msg.toolOutputs && msg.toolOutputs.length > 0 && (
                      <div className="space-y-2">
                        {msg.toolOutputs.map((toolOutput, index) => (
                          <ToolOutputCard 
                            key={`${msg.id}-tool-${index}`}
                            toolOutput={toolOutput}
                          />
                        ))}
                      </div>
                    )}
                    <p className={cn(
                      "text-xs mt-1 opacity-70",
                      msg.isUser ? "text-primary-foreground/70" : "text-muted-foreground/70"
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {(isStreaming || isLoading || progressMessage || streamingMessage) && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 rounded-2xl bg-muted text-muted-foreground rounded-bl-sm border border-border">
                    {progressMessage && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-primary">{progressMessage}</span>
                      </div>
                    )}
                    {streamingMessage ? (
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{streamingMessage}</ReactMarkdown>
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-75"></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input form */}
        <form 
          onSubmit={handleSubmit}
          className="p-4 border-t border-border bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading || isInitializing || !sessionId || isStreaming}
                className="w-full bg-background border border-input rounded-full py-3 pl-4 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
              />
              <button
                type="submit"
                disabled={input.trim() === "" || isLoading || isInitializing || !sessionId || isStreaming}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors",
                  input.trim() === "" || isLoading || isInitializing || !sessionId || isStreaming
                    ? "text-muted-foreground bg-muted cursor-not-allowed"
                    : "text-primary-foreground bg-primary hover:bg-primary/90"
                )}
              >
                {isLoading || isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            
            {/* Audio Recorder */}
            <AudioRecorder
              onTranscription={(text) => setInput(text)}
              onAutoSend={() => {
                // Auto-submit the form after transcription
                if (input.trim()) {
                  handleSubmit();
                }
              }}
              onError={(error) => toast({ 
                variant: "destructive", 
                title: "Recording Error", 
                description: error 
              })}
              disabled={isLoading || isInitializing || !sessionId || isStreaming}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
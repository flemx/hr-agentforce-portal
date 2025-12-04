import { getValidToken } from "./salesforce";

interface AgentSession {
  sessionId: string;
  agentId: string;
  createdAt: string;
  endpoint: string;
}

export interface ToolOutput {
  type: string;
  value: {
    outputPromptResponse?: string;
    [key: string]: any;
  };
  property?: string;
}

export interface AgentMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  toolOutputs?: ToolOutput[];
}

interface SessionResponse {
  sessionId: string;
  streamingCapabilities: {
    chunkTypes: string[];
  };
}

interface AgentforceMessage {
  type: string;
  feedbackId: string;
  isContentSafe: boolean;
  message: string;
  id: string;
  metrics: Record<string, any>;
  planId: string;
  result: any[];
  citedReferences: any[];
}

interface MessageResponse {
  messages: AgentforceMessage[];
  _links: Record<string, any>;
}

const AGENTFORCE_BASE_URL = "https://api.salesforce.com/einstein/ai-agent/v1";
const SESSION_STORAGE_KEY = "agentforce_sessions";
const MESSAGES_STORAGE_KEY = "agentforce_messages";
const SEQUENCE_STORAGE_KEY = "agentforce_sequences";

// Session expiry time: 24 hours in milliseconds
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

// Session management
export const getStoredSession = (agentId: string): AgentSession | null => {
  try {
    const sessions = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessions) return null;

    const parsedSessions: Record<string, AgentSession> = JSON.parse(sessions);
    const session = parsedSessions[agentId];

    if (!session) return null;

    // Check if session endpoint matches current Salesforce instance
    const instanceUrl = process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL;
    if (instanceUrl && session.endpoint) {
      const normalizedSessionEndpoint = session.endpoint.replace(/\/$/, '');
      const normalizedInstanceUrl = instanceUrl.replace(/\/$/, '');

      if (normalizedSessionEndpoint !== normalizedInstanceUrl) {
        console.log(`[DEBUG] Session for agent ${agentId} uses different org (${session.endpoint} vs ${instanceUrl}), clearing...`);
        clearSession(agentId);
        return null;
      }
    }

    // Check if session has expired (older than 24 hours)
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    if (sessionAge > SESSION_EXPIRY_MS) {
      console.log(`[DEBUG] Session for agent ${agentId} has expired (age: ${Math.round(sessionAge / 1000 / 60)} minutes), clearing...`);
      clearSession(agentId);
      return null;
    }

    return session;
  } catch (error) {
    console.error("Error getting stored session:", error);
    return null;
  }
};

export const storeSession = (agentId: string, session: AgentSession): void => {
  try {
    const sessions = localStorage.getItem(SESSION_STORAGE_KEY);
    const parsedSessions: Record<string, AgentSession> = sessions
      ? JSON.parse(sessions)
      : {};

    parsedSessions[agentId] = session;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsedSessions));
  } catch (error) {
    console.error("Error storing session:", error);
  }
};

export const clearSession = (agentId: string): void => {
  try {
    const sessions = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessions) return;

    const parsedSessions: Record<string, AgentSession> = JSON.parse(sessions);
    delete parsedSessions[agentId];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsedSessions));

    // Also clear messages for this agent
    const messages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (messages) {
      const parsedMessages: Record<string, AgentMessage[]> =
        JSON.parse(messages);
      delete parsedMessages[agentId];
      localStorage.setItem(
        MESSAGES_STORAGE_KEY,
        JSON.stringify(parsedMessages),
      );
    }

    // Reset sequence ID for this agent
    resetSequenceId(agentId);
  } catch (error) {
    console.error("Error clearing session:", error);
  }
};

// Sequence ID management
export const getNextSequenceId = (agentId: string): number => {
  try {
    const sequences = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    const parsedSequences: Record<string, number> = sequences
      ? JSON.parse(sequences)
      : {};

    const currentSequenceId = parsedSequences[agentId] || 0;
    const nextSequenceId = currentSequenceId + 1;

    parsedSequences[agentId] = nextSequenceId;
    localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(parsedSequences));

    return nextSequenceId;
  } catch (error) {
    console.error("Error getting next sequence ID:", error);
    return 1;
  }
};

export const resetSequenceId = (agentId: string): void => {
  try {
    const sequences = localStorage.getItem(SEQUENCE_STORAGE_KEY);
    if (!sequences) return;

    const parsedSequences: Record<string, number> = JSON.parse(sequences);
    delete parsedSequences[agentId];
    localStorage.setItem(SEQUENCE_STORAGE_KEY, JSON.stringify(parsedSequences));
  } catch (error) {
    console.error("Error resetting sequence ID:", error);
  }
};

// Message management
export const getStoredMessages = (agentId: string): AgentMessage[] => {
  try {
    const messages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    if (!messages) {
      console.log(`[DEBUG] No stored messages found for agent ${agentId}`);
      return [];
    }

    const parsedMessages: Record<string, AgentMessage[]> = JSON.parse(messages);
    const agentMessages = parsedMessages[agentId] || [];
    console.log(
      `[DEBUG] Retrieved ${agentMessages.length} messages for agent ${agentId}:`,
      agentMessages.map((m) => ({ id: m.id, content: m.content.slice(0, 50) })),
    );
    return agentMessages;
  } catch (error) {
    console.error("Error getting stored messages:", error);
    return [];
  }
};

export const storeMessage = (agentId: string, message: AgentMessage): void => {
  try {
    const messages = localStorage.getItem(MESSAGES_STORAGE_KEY);
    const parsedMessages: Record<string, AgentMessage[]> = messages
      ? JSON.parse(messages)
      : {};

    if (!parsedMessages[agentId]) {
      parsedMessages[agentId] = [];
    }

    // Check for duplicate message IDs to prevent duplicates
    const existingMessage = parsedMessages[agentId].find(
      (m) => m.id === message.id,
    );
    if (existingMessage) {
      console.log(
        `[DEBUG] Message with ID ${message.id} already exists, skipping storage`,
      );
      return;
    }

    console.log(`[DEBUG] Storing new message for agent ${agentId}:`, {
      id: message.id,
      content: message.content.slice(0, 50),
    });
    parsedMessages[agentId].push(message);
    localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(parsedMessages));
  } catch (error) {
    console.error("Error storing message:", error);
  }
};

// Agentforce API calls
export const initiateSession = async (
  agentId: string,
): Promise<AgentSession> => {
  try {
    const token = await getValidToken();

    const instanceUrl = process.env.NEXT_PUBLIC_SALESFORCE_INSTANCE_URL;
    if (!instanceUrl) {
      throw new Error("NEXT_PUBLIC_SALESFORCE_INSTANCE_URL is not configured");
    }

    const requestBody = {
      externalSessionKey: "{}",
      instanceConfig: {
        endpoint: instanceUrl,
      },
      streamingCapabilities: {
        chunkTypes: ["Text"],
      },
      bypassUser: false,
    };

    const response = await fetch(
      `${AGENTFORCE_BASE_URL}/agents/${agentId}/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to initiate session: ${response.status} ${response.statusText}`,
      );
    }

    const data: SessionResponse = await response.json();

    const session: AgentSession = {
      sessionId: data.sessionId,
      agentId,
      createdAt: new Date().toISOString(),
      endpoint: instanceUrl,
    };

    storeSession(agentId, session);
    return session;
  } catch (error) {
    console.error("Error initiating session:", error);
    throw error;
  }
};

// Streaming event types
export interface StreamingEvent {
  timestamp: number;
  originEventId: string;
  traceId: string;
  offset: number;
  message: StreamingMessage;
}

export interface StreamingMessage {
  type:
    | "ProgressIndicator"
    | "TextChunk"
    | "Inform"
    | "EndOfTurn"
    | "ValidationFailureChunk"
    | "Inquire"
    | "Confirm"
    | "Failure"
    | "Escalate"
    | "SessionEnded"
    | "Error";
  id: string;
  [key: string]: any;
}

export interface StreamingCallbacks {
  onProgress?: (message: string) => void;
  onTextChunk?: (chunk: string, offset: number) => void;
  onInform?: (message: AgentMessage) => void;
  onEndOfTurn?: () => void;
  onValidationFailure?: () => void;
  onError?: (error: string) => void;
}

export const sendStreamingMessage = async (
  agentId: string,
  sessionId: string,
  message: string,
  callbacks: StreamingCallbacks,
): Promise<void> => {
  try {
    const token = await getValidToken();

    // Get next sequence ID
    const sequenceId = getNextSequenceId(agentId);

    // DON'T store user message here - it's already stored by the calling component

    const requestBody = {
      message: {
        type: "Text",
        sequenceId: sequenceId,
        text: message,
      },
    };

    const response = await fetch(
      `${AGENTFORCE_BASE_URL}/sessions/${sessionId}/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      // If session not found (404), clear the expired session
      if (response.status === 404) {
        console.log(`[DEBUG] Session ${sessionId} not found (404), clearing expired session for agent ${agentId}`);
        clearSession(agentId);
        throw new Error(
          `Session expired. Please start a new conversation.`,
        );
      }
      throw new Error(
        `Failed to send streaming message: ${response.status} ${response.statusText}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No reader available for streaming response");
    }

    const decoder = new TextDecoder();
    let buffer = "";
    let currentAgentMessage: AgentMessage | null = null;
    let isValidationFailure = false;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const jsonData = line.slice(6);
              if (jsonData.trim() === "") continue;

              const event: StreamingEvent = JSON.parse(jsonData);

              switch (event.message.type) {
                case "ProgressIndicator":
                  callbacks.onProgress?.(
                    event.message.message || "Working on it...",
                  );
                  break;

                case "TextChunk":
                  if (!isValidationFailure) {
                    callbacks.onTextChunk?.(
                      event.message.message,
                      event.message.offset,
                    );
                  }
                  break;

                case "ValidationFailureChunk":
                  isValidationFailure = true;
                  callbacks.onValidationFailure?.();
                  callbacks.onTextChunk?.(
                    event.message.message,
                    event.message.offset,
                  );
                  break;

                case "Inform":
                  // Handle complete message - this might come as a different format
                  if (event.message.message) {
                    currentAgentMessage = {
                      id: event.message.id,
                      content: event.message.message,
                      isUser: false,
                      timestamp: new Date().toISOString(),
                      toolOutputs: event.message.result || [],
                    };
                    storeMessage(agentId, currentAgentMessage);
                    callbacks.onInform?.(currentAgentMessage);
                  }
                  break;

                case "Inquire":
                  console.log(
                    `[DEBUG] Received Inquire event with message:`,
                    event.message.message,
                  );
                  if (event.message.message) {
                    const inquireMessage: AgentMessage = {
                      id: event.message.id,
                      content: event.message.message,
                      isUser: false,
                      timestamp: new Date().toISOString(),
                      toolOutputs: event.message.result || [],
                    };
                    storeMessage(agentId, inquireMessage);
                    callbacks.onInform?.(inquireMessage);
                  }
                  break;

                case "EndOfTurn":
                  callbacks.onEndOfTurn?.();
                  break;

                case "Error":
                case "Failure":
                  callbacks.onError?.(
                    event.message.message || "An error occurred",
                  );
                  break;

                default:
                  console.log(
                    "Unhandled streaming event type:",
                    event.message.type,
                  );
              }
            } catch (parseError) {
              console.error("Error parsing streaming event:", parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    console.error("Error in streaming message:", error);
    callbacks.onError?.(
      error instanceof Error ? error.message : "Unknown error occurred",
    );
    throw error;
  }
};

// Keep the original sendMessage for backward compatibility
export const sendMessage = async (
  agentId: string,
  sessionId: string,
  message: string,
): Promise<AgentMessage> => {
  try {
    const token = await getValidToken();

    // Get next sequence ID
    const sequenceId = getNextSequenceId(agentId);

    // DON'T store user message here - it's already stored by the calling component

    const requestBody = {
      message: {
        type: "Text",
        sequenceId: sequenceId,
        text: message,
      },
    };

    const response = await fetch(
      `${AGENTFORCE_BASE_URL}/sessions/${sessionId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      // If session not found (404), clear the expired session
      if (response.status === 404) {
        console.log(`[DEBUG] Session ${sessionId} not found (404), clearing expired session for agent ${agentId}`);
        clearSession(agentId);
        throw new Error(
          `Session expired. Please start a new conversation.`,
        );
      }
      throw new Error(
        `Failed to send message: ${response.status} ${response.statusText}`,
      );
    }

    const data: MessageResponse = await response.json();

    // Get the first message from the response
    const firstMessage = data.messages?.[0];
    if (!firstMessage) {
      throw new Error("No message in response");
    }

    const agentResponse: AgentMessage = {
      id: firstMessage.id,
      content: firstMessage.message,
      isUser: false,
      timestamp: new Date().toISOString(),
    };

    storeMessage(agentId, agentResponse);
    return agentResponse;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const getOrCreateSession = async (
  agentId: string,
): Promise<AgentSession> => {
  let session = getStoredSession(agentId);

  if (!session) {
    session = await initiateSession(agentId);
  }

  return session;
};

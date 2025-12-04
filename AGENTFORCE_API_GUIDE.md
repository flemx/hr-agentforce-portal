# Salesforce AgentForce API Integration Guide

This document provides a comprehensive guide to working with the Salesforce AgentForce API in our HR Agents Portal application. It covers the API implementation, streaming responses, event handling, and UI customization.

## Table of Contents

1. [Overview](#overview)
2. [API Architecture](#api-architecture)
3. [Session Management](#session-management)
4. [Message Flow](#message-flow)
5. [Streaming Event Types](#streaming-event-types)
6. [Implementation Details](#implementation-details)
7. [UI Rendering](#ui-rendering)
8. [Customization Guide](#customization-guide)
9. [Best Practices](#best-practices)

---

## Overview

The AgentForce API is Salesforce's conversational AI agent platform that allows applications to interact with AI agents through REST API calls. Our application uses:

- **Base URL**: `https://api.salesforce.com/einstein/ai-agent/v1`
- **Authentication**: JWT-based Bearer tokens via OAuth client credentials flow
- **Communication**: REST API with streaming support (Server-Sent Events)
- **Instance URL**: Configured via `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL` environment variable

### Key Files

- **API Layer**: [src/utils/agentforceApi.ts](src/utils/agentforceApi.ts) - Core API implementation
- **UI Layer**: [src/components/AgentChat.tsx](src/components/AgentChat.tsx) - Chat interface
- **Tool Display**: [src/components/ToolOutputCard.tsx](src/components/ToolOutputCard.tsx) - Tool output rendering
- **Agent Icons**: [src/utils/agentIcons.tsx](src/utils/agentIcons.tsx) - Agent categorization and icons

---

## API Architecture

### Authentication Flow

```
1. Frontend → Backend API: Request with Bearer token (password)
2. Backend: Validate Bearer token against AUTH_PASSWORD
3. Backend → Salesforce: OAuth client credentials flow
   - Uses NEXT_PUBLIC_SALESFORCE_INSTANCE_URL, SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET
   - Token URL constructed as: {NEXT_PUBLIC_SALESFORCE_INSTANCE_URL}/services/oauth2/token
4. Salesforce → Backend: Access token (expires in ~30 mins)
5. Backend → Frontend: Token for API calls
6. Frontend → AgentForce API: Bearer token in headers
```

**Token Management**: Implemented in [src/utils/salesforce.ts](src/utils/salesforce.ts)
- Tokens cached with expiry tracking
- Automatic refresh before expiration
- Function: `getValidToken()` handles all token lifecycle

**Environment Variables Required**:
- `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL` - Salesforce instance URL (used by both frontend and backend)
- `SALESFORCE_CLIENT_ID` - Salesforce connected app client ID
- `SALESFORCE_CLIENT_SECRET` - Salesforce connected app client secret

**Note**: The OAuth token endpoint URL is automatically constructed as `{NEXT_PUBLIC_SALESFORCE_INSTANCE_URL}/services/oauth2/token`

### Request Structure

All AgentForce API requests require:

```typescript
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
  'Accept': 'text/event-stream' // For streaming endpoints
}
```

---

## Session Management

### Session Lifecycle

**Location**: [src/utils/agentforceApi.ts:217-267](src/utils/agentforceApi.ts#L217-L267)

```typescript
interface AgentSession {
  sessionId: string;      // Unique session ID from Salesforce
  agentId: string;        // Agent identifier
  createdAt: string;      // ISO timestamp for expiry tracking
  endpoint: string;       // Salesforce instance URL
}
```

#### 1. Starting a Session

**API Endpoint**: `POST /agents/{agentId}/sessions`

**Request Body**:
```json
{
  "externalSessionKey": "{}",
  "instanceConfig": {
    "endpoint": "<NEXT_PUBLIC_SALESFORCE_INSTANCE_URL from environment>"
  },
  "streamingCapabilities": {
    "chunkTypes": ["Text"]
  },
  "bypassUser": false
}
```

**Response**:
```json
{
  "sessionId": "019987b9-554f-7394-84e9-c6b5b32b9102",
  "streamingCapabilities": {
    "chunkTypes": ["Text"]
  }
}
```

**Implementation**: `initiateSession(agentId: string)`

#### 2. Session Storage

**Storage Keys**:
- `agentforce_sessions` - Session metadata indexed by agentId
- `agentforce_messages` - Message history indexed by agentId
- `agentforce_sequences` - Sequence ID counter for each agent

**Session Expiry**:
- Sessions expire after **24 hours** (configurable via `SESSION_EXPIRY_MS`)
- Automatically checked on retrieval: [src/utils/agentforceApi.ts:60-83](src/utils/agentforceApi.ts#L60-L83)
- Expired sessions cleared automatically
- 404 responses also trigger session cleanup: [src/utils/agentforceApi.ts:339-351](src/utils/agentforceApi.ts#L339-L351)

```typescript
// Session expiry check
const sessionAge = Date.now() - new Date(session.createdAt).getTime();
if (sessionAge > SESSION_EXPIRY_MS) {
  clearSession(agentId);
  return null;
}
```

#### 3. Clearing Sessions

**Function**: `clearSession(agentId: string)`

When a session is cleared:
1. Session metadata removed from localStorage
2. All message history deleted for that agent
3. Sequence ID counter reset to 0
4. User can start fresh conversation

**UI Integration**: Refresh button (🔄) in chat header triggers `handleNewSession()`

---

## Message Flow

### Sequence IDs

Each message in a session requires a unique, incrementing `sequenceId`:

```typescript
// First message: sequenceId = 1
// Second message: sequenceId = 2
// Third message: sequenceId = 3
```

**Management**: [src/utils/agentforceApi.ts:128-146](src/utils/agentforceApi.ts#L128-L146)
- Counter stored in localStorage per agent
- Auto-incremented with each message
- Reset when session cleared

### Non-Streaming Messages

**API Endpoint**: `POST /sessions/{sessionId}/messages`

**Request**:
```json
{
  "message": {
    "type": "Text",
    "sequenceId": 1,
    "text": "What is my PTO balance?"
  }
}
```

**Response**:
```json
{
  "messages": [
    {
      "type": "Inform",
      "id": "msg-123",
      "message": "Your PTO balance is 15 days.",
      "isContentSafe": true,
      "result": [],
      "citedReferences": []
    }
  ]
}
```

**Use Case**: Simple request-response, no streaming needed

**Implementation**: `sendMessage()` at [src/utils/agentforceApi.ts:474-542](src/utils/agentforceApi.ts#L474-L542)

### Streaming Messages (Recommended)

**API Endpoint**: `POST /sessions/{sessionId}/messages/stream`

**Request**: Same as non-streaming

**Response**: Server-Sent Events (SSE) stream

```
data: {"timestamp":123,"message":{"type":"ProgressIndicator","message":"Searching..."}}

data: {"timestamp":124,"message":{"type":"TextChunk","message":"Your ","offset":0}}

data: {"timestamp":125,"message":{"type":"TextChunk","message":"PTO balance ","offset":5}}

data: {"timestamp":126,"message":{"type":"Inform","id":"msg-123","message":"Your PTO balance is 15 days."}}

data: {"timestamp":127,"message":{"type":"EndOfTurn"}}
```

**Use Case**: Real-time feedback, better UX for long operations

**Implementation**: `sendStreamingMessage()` at [src/utils/agentforceApi.ts:304-471](src/utils/agentforceApi.ts#L304-L471)

---

## Streaming Event Types

### Event Structure

All streaming events follow this structure:

```typescript
interface StreamingEvent {
  timestamp: number;       // Unix timestamp
  originEventId: string;   // Event correlation ID
  traceId: string;         // Request trace ID
  offset: number;          // Character offset for text chunks
  message: StreamingMessage;
}

interface StreamingMessage {
  type: string;           // Event type (see below)
  id: string;             // Message ID (when applicable)
  message?: string;       // Message content
  result?: any[];         // Tool outputs
  [key: string]: any;     // Type-specific fields
}
```

### 1. ProgressIndicator

**Purpose**: Show user what the agent is doing (e.g., "Searching...", "Analyzing...")

**Structure**:
```json
{
  "type": "ProgressIndicator",
  "message": "Searching knowledge base..."
}
```

**UI Handling**: [src/components/AgentChat.tsx:149-151](src/components/AgentChat.tsx#L149-L151)
```typescript
onProgress: (message) => {
  setProgressMessage(message); // Shows loading spinner with message
}
```

**Display**: Appears below messages with spinner icon

### 2. TextChunk

**Purpose**: Stream response text in real-time (word by word or phrase by phrase)

**Structure**:
```json
{
  "type": "TextChunk",
  "message": "Your PTO balance ",
  "offset": 0
}
```

**Fields**:
- `message`: Text chunk to append
- `offset`: Character position in the full message (0 = start fresh)

**UI Handling**: [src/components/AgentChat.tsx:152-163](src/components/AgentChat.tsx#L152-L163)
```typescript
onTextChunk: (chunk, offset) => {
  setStreamingMessage(prev => {
    // offset === 0: Start new message
    // offset > 0: Append to existing message
    return offset === 0 ? chunk : prev + chunk;
  });
}
```

**Display**: Shows with animated cursor pulse in chat bubble

### 3. ValidationFailureChunk

**Purpose**: Agent detected validation error (e.g., missing required info)

**Structure**:
```json
{
  "type": "ValidationFailureChunk",
  "message": "I need your employee ID to look up that information.",
  "offset": 0
}
```

**UI Handling**: [src/utils/agentforceApi.ts:396-403](src/utils/agentforceApi.ts#L396-L403)
```typescript
case "ValidationFailureChunk":
  isValidationFailure = true;
  callbacks.onValidationFailure?.();
  callbacks.onTextChunk?.(event.message.message, event.message.offset);
  break;
```

**Behavior**: Clears previous streaming chunks, displays validation message

### 4. Inform

**Purpose**: Final complete message from agent, includes tool outputs

**Structure**:
```json
{
  "type": "Inform",
  "id": "msg-abc123",
  "message": "Your PTO balance is 15 days remaining.",
  "isContentSafe": true,
  "result": [
    {
      "type": "copilotActionOutput/Get_PTO_Balance",
      "value": {
        "outputPromptResponse": "Balance: 15 days"
      }
    }
  ]
}
```

**UI Handling**: [src/utils/agentforceApi.ts:405-418](src/utils/agentforceApi.ts#L405-L418)
```typescript
case "Inform":
  const agentMessage: AgentMessage = {
    id: event.message.id,
    content: event.message.message,
    isUser: false,
    timestamp: new Date().toISOString(),
    toolOutputs: event.message.result || []
  };
  storeMessage(agentId, agentMessage);
  callbacks.onInform?.(agentMessage);
  break;
```

**Display**: Added to permanent message history with tool outputs rendered

### 5. Inquire

**Purpose**: Agent asking follow-up question

**Structure**:
```json
{
  "type": "Inquire",
  "id": "msg-xyz789",
  "message": "Which month would you like to request PTO for?",
  "result": []
}
```

**UI Handling**: [src/utils/agentforceApi.ts:420-436](src/utils/agentforceApi.ts#L420-L436)
- Treated similar to `Inform`
- Stored in message history
- User can respond normally

### 6. EndOfTurn

**Purpose**: Agent finished processing, ready for next user input

**Structure**:
```json
{
  "type": "EndOfTurn"
}
```

**UI Handling**: [src/components/AgentChat.tsx:170-175](src/components/AgentChat.tsx#L170-L175)
```typescript
onEndOfTurn: () => {
  setIsStreaming(false);
  setStreamingMessage("");
  setProgressMessage("");
}
```

**Behavior**: Clears loading states, re-enables input field

### 7. Error / Failure

**Purpose**: Agent encountered an error

**Structure**:
```json
{
  "type": "Error",
  "message": "Unable to connect to the service."
}
```

**UI Handling**: [src/utils/agentforceApi.ts:442-447](src/utils/agentforceApi.ts#L442-L447)
```typescript
case "Error":
case "Failure":
  callbacks.onError?.(event.message.message || "An error occurred");
  break;
```

**Display**: Toast notification with error message

### 8. Confirm

**Purpose**: Agent requests user confirmation before action

**Not currently handled** - Could be implemented for approval workflows

### 9. Escalate

**Purpose**: Agent escalates to human support

**Not currently handled** - Could trigger support ticket creation

### 10. SessionEnded

**Purpose**: Session terminated by agent or system

**Not currently handled** - Would trigger automatic cleanup

---

## Implementation Details

### Streaming Response Parser

**Location**: [src/utils/agentforceApi.ts:363-440](src/utils/agentforceApi.ts#L363-L440)

The streaming parser uses the Fetch API with ReadableStream:

```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  buffer += decoder.decode(value, { stream: true });
  const lines = buffer.split("\n");
  buffer = lines.pop() || ""; // Keep incomplete line in buffer

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const jsonData = line.slice(6); // Remove "data: " prefix
      const event: StreamingEvent = JSON.parse(jsonData);

      // Process event based on type
      switch (event.message.type) {
        case "ProgressIndicator": /* ... */ break;
        case "TextChunk": /* ... */ break;
        // ... etc
      }
    }
  }
}
```

**Key Concepts**:
1. **Buffering**: Incomplete JSON strings buffered until next chunk arrives
2. **Line-by-line**: SSE protocol uses `\n` as delimiter
3. **Prefix stripping**: Remove `data: ` before parsing JSON
4. **Type switching**: Route events to appropriate callbacks

### Message Storage

**Message Structure**:
```typescript
interface AgentMessage {
  id: string;              // Unique message ID
  content: string;         // Message text (markdown supported)
  isUser: boolean;         // true = user, false = agent
  timestamp: string;       // ISO 8601 timestamp
  toolOutputs?: ToolOutput[]; // Optional tool results
}
```

**Storage Implementation**: [src/utils/agentforceApi.ts:162-214](src/utils/agentforceApi.ts#L162-L214)

**Deduplication**: Messages checked by ID to prevent duplicates
```typescript
const existingMessage = parsedMessages[agentId].find(m => m.id === message.id);
if (existingMessage) {
  return; // Skip duplicate
}
```

### Error Handling

#### Session Expiry (404)

When API returns 404:
1. Session cleared from localStorage
2. Error message: "Session expired. Please start a new conversation."
3. User prompted to click "Start New Session" button

**Code**: [src/utils/agentforceApi.ts:339-351](src/utils/agentforceApi.ts#L339-L351)

#### Network Errors

All network errors caught and displayed via toast notifications

**Code**: [src/components/AgentChat.tsx:192-214](src/components/AgentChat.tsx#L192-L214)

---

## UI Rendering

### Chat Interface Structure

**File**: [src/components/AgentChat.tsx](src/components/AgentChat.tsx)

**Layout**:
```
┌─────────────────────────────────┐
│ Header (Agent name, icons)      │
├─────────────────────────────────┤
│                                 │
│ Messages Container (scrollable) │
│  ├─ User Message                │
│  ├─ Agent Message                │
│  │  └─ Tool Output Cards        │
│  ├─ User Message                │
│  ├─ Agent Streaming (with ●)    │
│                                 │
├─────────────────────────────────┤
│ Input Field [Send] [Audio]      │
└─────────────────────────────────┘
```

### Message Bubbles

**User Messages**: [src/components/AgentChat.tsx:307-343](src/components/AgentChat.tsx#L307-L343)
- Right-aligned
- Primary color background
- Rounded corners (except bottom-right)

**Agent Messages**:
- Left-aligned
- Muted background with border
- Rounded corners (except bottom-left)
- Supports markdown rendering via `react-markdown`

### Markdown Support

**Library**: `react-markdown` with `remark-gfm` (GitHub Flavored Markdown)

**Supported Features**:
- Headers (`# ## ###`)
- Lists (bullet, numbered)
- Tables
- Bold, italic
- Code blocks with syntax highlighting
- Links

**Styling**: [src/components/AgentChat.tsx:320](src/components/AgentChat.tsx#L320)
- Custom Tailwind prose classes
- Table borders and backgrounds
- Compact spacing for chat context

### Tool Output Cards

**File**: [src/components/ToolOutputCard.tsx](src/components/ToolOutputCard.tsx)

**Structure**:
```typescript
interface ToolOutput {
  type: string;           // e.g., "copilotActionOutput/Get_PTO_Balance"
  value: {
    outputPromptResponse?: string;  // Formatted response
    [key: string]: any;             // Additional data
  };
  property?: string;
}
```

**Rendering Logic**:

1. **Extract Tool Name**: Parse `copilotActionOutput/<name>` format
2. **Get Icon**: Match tool type to appropriate Lucide icon
3. **Get Content**: Priority order:
   - `value.outputPromptResponse` (primary)
   - Any other string value in `value` object
   - JSON stringification (fallback)

4. **Render Format**:
   - **HTML content**: Rendered with `dangerouslySetInnerHTML`
   - **Image/link extraction**: Show previews for `<img>` and `<a>` tags
   - **Plain text**: Rendered with markdown support

**Image/Link Previews**: [src/components/ToolOutputCard.tsx:63-165](src/components/ToolOutputCard.tsx#L63-L165)
- Extracts URLs from HTML
- Shows image previews with fallback
- Displays clickable links with metadata

### Streaming Indicators

**Progress Message**: [src/components/AgentChat.tsx:349-353](src/components/AgentChat.tsx#L349-L353)
- Spinning loader icon
- Status text (e.g., "Searching...")
- Primary color highlighting

**Text Streaming**: [src/components/AgentChat.tsx:355-359](src/components/AgentChat.tsx#L355-L359)
- Partial message content
- Animated cursor pulse (█)
- Updates in real-time

**Default Loading**: [src/components/AgentChat.tsx:361-365](src/components/AgentChat.tsx#L361-L365)
- Three animated dots
- Shown when waiting without progress

---

## Customization Guide

### Adding New Streaming Event Types

**1. Update Type Definition**

[src/utils/agentforceApi.ts:278-293](src/utils/agentforceApi.ts#L278-L293)

```typescript
interface StreamingMessage {
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
    | "Error"
    | "NewCustomType";  // Add here
  // ...
}
```

**2. Add Callback Interface**

[src/utils/agentforceApi.ts:295-302](src/utils/agentforceApi.ts#L295-L302)

```typescript
export interface StreamingCallbacks {
  onProgress?: (message: string) => void;
  onTextChunk?: (chunk: string, offset: number) => void;
  onInform?: (message: AgentMessage) => void;
  onEndOfTurn?: () => void;
  onValidationFailure?: () => void;
  onError?: (error: string) => void;
  onCustomEvent?: (data: any) => void;  // Add here
}
```

**3. Add Switch Case Handler**

[src/utils/agentforceApi.ts:380-454](src/utils/agentforceApi.ts#L380-L454)

```typescript
switch (event.message.type) {
  case "ProgressIndicator":
    /* ... */
    break;

  case "NewCustomType":
    callbacks.onCustomEvent?.(event.message);
    break;

  default:
    console.log("Unhandled streaming event type:", event.message.type);
}
```

**4. Implement UI Handler**

[src/components/AgentChat.tsx:148-190](src/components/AgentChat.tsx#L148-L190)

```typescript
await sendStreamingMessage(agent.id, sessionId, messageText, {
  onProgress: (message) => { /* ... */ },
  onTextChunk: (chunk, offset) => { /* ... */ },
  onCustomEvent: (data) => {
    // Handle custom event in UI
    setCustomState(data);
  },
  // ... other handlers
});
```

### Customizing Tool Output Display

**File**: [src/components/ToolOutputCard.tsx](src/components/ToolOutputCard.tsx)

**Add Custom Tool Icon**:

```typescript
const getToolIcon = (toolType: string) => {
  if (toolType.includes("PTO")) return <FileText className="h-4 w-4" />;
  if (toolType.includes("Database")) return <Database className="h-4 w-4" />;
  if (toolType.includes("CustomTool")) return <CustomIcon className="h-4 w-4" />;
  return <Terminal className="h-4 w-4" />;
};
```

**Add Custom Tool Name Formatting**:

```typescript
const getToolDisplayName = (toolType: string): string => {
  // Handle special cases
  if (toolType.includes("Get_PTO_Balance")) {
    return "PTO Balance Lookup";
  }

  // Default formatting
  const match = toolType.match(/copilotActionOutput\/(.+)/);
  if (match) {
    return match[1].replace(/([A-Z])/g, ' $1').trim();
  }
  return toolType;
};
```

**Add Custom Content Rendering**:

```typescript
// In ToolOutputCard component
{hasCustomFormat(content) ? (
  <CustomRenderer data={parseCustomData(content)} />
) : hasHtmlTags ? (
  <div dangerouslySetInnerHTML={{ __html: content }} />
) : (
  <ReactMarkdown>{content}</ReactMarkdown>
)}
```

### Customizing Agent Icons & Categories

**File**: [src/utils/agentIcons.tsx](src/utils/agentIcons.tsx)

**Add New Agent Icon**:

```typescript
import { UserPlus, Calendar, NewIcon } from "lucide-react";

export const getAgentIcon = (agentTemplate: string, developerName: string) => {
  if (agentTemplate?.includes('Slack')) {
    return <Slack className="w-6 h-6" />;
  }

  if (agentTemplate?.includes('NewAgent')) {
    return <NewIcon className="w-6 h-6" />;
  }

  // ... other mappings

  return <MessageCircleQuestion className="w-6 h-6" />;
};
```

**Add New Category**:

```typescript
export const getAgentCategory = (agentTemplate: string) => {
  if (agentTemplate?.includes('Slack')) {
    return 'Slack Integration';
  }

  if (agentTemplate?.includes('CustomType')) {
    return 'Custom Category';
  }

  return 'AI Agent';
};
```

### Adjusting Session Expiry

**File**: [src/utils/agentforceApi.ts](src/utils/agentforceApi.ts)

```typescript
// Change from 24 hours to 48 hours
const SESSION_EXPIRY_MS = 48 * 60 * 60 * 1000;

// Or use shorter expiry for testing
const SESSION_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
```

### Customizing Chat UI

**Resize Limits**: [src/components/AgentChat.tsx:53-54](src/components/AgentChat.tsx#L53-L54)

```typescript
const minWidth = 320;  // Increase for wider minimum
const maxWidth = 800;  // Increase for wider maximum
```

**Default Width**: [src/components/AgentChat.tsx:38](src/components/AgentChat.tsx#L38)

```typescript
const [width, setWidth] = useState<number>(480); // Change default
```

**Message Bubble Width**: [src/components/AgentChat.tsx:303](src/components/AgentChat.tsx#L303)

```typescript
className="max-w-[85%]"  // Change to max-w-[90%] or max-w-full
```

---

## Best Practices

### 1. Always Use Streaming for Better UX

Streaming provides real-time feedback and makes the application feel more responsive:

```typescript
// ✅ Good: Use streaming
await sendStreamingMessage(agentId, sessionId, message, callbacks);

// ❌ Avoid: Non-streaming (unless necessary)
await sendMessage(agentId, sessionId, message);
```

### 2. Handle All Event Types

Always implement all callback handlers, even if just logging:

```typescript
await sendStreamingMessage(agentId, sessionId, message, {
  onProgress: (msg) => console.log('Progress:', msg),
  onTextChunk: (chunk, offset) => /* Update UI */,
  onInform: (message) => /* Store message */,
  onEndOfTurn: () => /* Clean up */,
  onValidationFailure: () => /* Show error */,
  onError: (error) => /* Show toast */,
});
```

### 3. Store Messages Consistently

Always store both user and agent messages:

```typescript
// ✅ Store user message before sending
const userMessage = createUserMessage(text);
setMessages(prev => [...prev, userMessage]);
storeMessage(agentId, userMessage);

// Send to API
await sendStreamingMessage(/* ... */);

// ✅ Agent messages stored in Inform/Inquire handlers
```

### 4. Clear State on Session Change

When starting new session or switching agents:

```typescript
const handleNewSession = async () => {
  // Clear all state
  clearSession(agent.id);
  setMessages([]);
  setSessionId(null);
  setStreamingMessage("");
  setProgressMessage("");

  // Reinitialize
  await initializeChat();
};
```

### 5. Implement Error Boundaries

Wrap streaming components in error boundaries:

```typescript
try {
  await sendStreamingMessage(/* ... */);
} catch (error) {
  // Always handle errors
  toast({ title: "Error", description: error.message });
  clearSession(agentId); // Clean up on failure
}
```

### 6. Use Markdown for Rich Content

Allow markdown in agent responses for better formatting:

```typescript
// Agent can return markdown
const response = `
## Your PTO Summary

- **Available**: 15 days
- **Used**: 5 days
- **Pending**: 2 days
`;
```

### 7. Optimize Tool Output Display

Prioritize content extraction:

```typescript
// 1. Check outputPromptResponse first (formatted by agent)
let content = toolOutput.value?.outputPromptResponse;

// 2. Fall back to other string values
if (!content) {
  for (const key in toolOutput.value) {
    if (typeof toolOutput.value[key] === 'string') {
      content = toolOutput.value[key];
      break;
    }
  }
}

// 3. JSON fallback only as last resort
if (!content) {
  content = JSON.stringify(toolOutput.value, null, 2);
}
```

### 8. Monitor Session Health

Log session lifecycle events:

```typescript
console.log('[DEBUG] Session created:', sessionId);
console.log('[DEBUG] Session age:', sessionAge);
console.log('[DEBUG] Session expired, clearing...');
```

This helps debug session-related issues in production.

### 9. Test Streaming Edge Cases

Test these scenarios:
- ✅ Network disconnection mid-stream
- ✅ Session expiry during message
- ✅ Rapid message sending
- ✅ Large tool outputs
- ✅ HTML/XSS in tool outputs
- ✅ Malformed JSON in stream

### 10. Keep Token Fresh

Implement proactive token refresh:

```typescript
// In getValidToken()
const bufferTime = 5 * 60 * 1000; // 5 minutes before expiry
if (token.expiresAt - Date.now() < bufferTime) {
  // Refresh early to avoid mid-request expiry
  token = await refreshToken();
}
```

---

## Troubleshooting

### Session 404 Errors

**Symptom**: API returns 404 on message send

**Causes**:
1. Session expired on Salesforce side (inactive > 24hrs)
2. Session manually deleted
3. Invalid session ID

**Solution**: Automatically handled via error detection and `clearSession()`

### Duplicate Messages

**Symptom**: Same message appears twice in chat

**Causes**:
1. Message stored in both TextChunk handler and Inform handler
2. React re-rendering storing message multiple times

**Solution**:
- Only store messages in `Inform`/`Inquire` handlers
- Implement deduplication by message ID
- Use `useEffect` dependencies carefully

### Streaming Not Working

**Symptom**: Messages arrive all at once instead of streaming

**Causes**:
1. Missing `Accept: text/event-stream` header
2. Browser/proxy buffering SSE
3. CORS issues

**Solution**:
- Verify headers in request
- Check browser console for CORS errors
- Test with curl to rule out client issues

### Tool Outputs Not Displaying

**Symptom**: Message shows but tool card missing

**Causes**:
1. Tool outputs not in `result` field
2. Content extraction failing
3. Rendering error

**Solution**:
- Log `event.message.result` in Inform handler
- Check ToolOutputCard for errors
- Verify `toolOutput.value` structure

---

## Related Documentation

- **Salesforce AgentForce API Docs**: https://developer.salesforce.com/docs/einstein/genai/guide/agent-api-get-started.html
- **Project Overview**: [CLAUDE.md](CLAUDE.md#agentforce-integration)
- **API Implementation**: [src/utils/agentforceApi.ts](src/utils/agentforceApi.ts)
- **Chat UI**: [src/components/AgentChat.tsx](src/components/AgentChat.tsx)

---

**Last Updated**: 2025-12-03
**Version**: 1.0

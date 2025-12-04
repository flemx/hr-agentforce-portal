# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Start development server**: `npm run dev` (runs on port 8080)
- **Build for production**: `npm run build`
- **Start production server**: `npm start`
- **Lint code**: `npm run lint`

## Project Architecture

This is a full-stack Next.js TypeScript application that serves as an HR Agents Portal integrated with Salesforce AgentForce. The application enables users to interact with Salesforce AI agents through a chat interface. Frontend and backend are integrated in a single Next.js application using App Router and API Routes, with JWT-based authentication protecting all routes.

### Key Technologies
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Frontend**: React 18 + Next.js
- **Backend**: Next.js API Routes (integrated)
- **Authentication**: JWT with HTTP-only cookies + Next.js Middleware
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query for server state
- **External API**: Salesforce AgentForce integration

### Application Structure

**Next.js App Directory:**
- `src/app/layout.tsx` - Root layout with providers and global styles
- `src/app/page.tsx` - Home page (renders Landing component)
- `src/app/login/page.tsx` - Login page
- `src/app/agents/page.tsx` - Agents portal page
- `src/app/not-found.tsx` - 404 error page
- `src/app/globals.css` - Global styles and Tailwind configuration

**API Routes (Backend):**
- `src/app/api/auth/login/route.ts` - JWT login endpoint (validates password, sets cookie)
- `src/app/api/auth/logout/route.ts` - Logout endpoint (clears auth cookie)
- `src/app/api/auth/verify/route.ts` - Token verification endpoint
- `src/app/api/salesforce/session-token/route.ts` - Get Salesforce access token endpoint
- `src/app/api/salesforce/transcription/route.ts` - Audio transcription endpoint
- `src/lib/auth.ts` - Authentication middleware for API routes
- `src/lib/jwt.ts` - JWT token generation and verification utilities
- `src/middleware.ts` - Next.js middleware for route protection (runs on Edge Runtime)

**Page Components:**
- `src/pages/Landing.tsx` - Landing page content
- `src/pages/HRAgents.tsx` - Main agents portal with agent grid and chat interface
- `src/pages/Login.tsx` - Login page content
- `src/pages/NotFound.tsx` - 404 error page content

**Key Components:**
- `src/components/AgentCard.tsx` - Individual agent display cards
- `src/components/AgentChat.tsx` - Chat interface for agent interactions
- `src/components/AudioRecorder.tsx` - Voice input functionality
- `src/components/SearchBar.tsx` - Agent search functionality
- `src/components/ToolOutputCard.tsx` - Display tool outputs from agents
- `src/components/ProtectedRoute.tsx` - Client-side route protection wrapper (uses useAuth hook)
- `src/components/providers/QueryProvider.tsx` - TanStack Query provider wrapper

**Custom Hooks:**
- `src/hooks/useAuth.ts` - Authentication state management hook (provides isAuthenticated, isLoading, logout, checkAuth)

**Salesforce Integration:**
- `src/utils/salesforce.ts` - Core Salesforce authentication and API utilities
- `src/utils/agentforceApi.ts` - AgentForce-specific API interactions
- `src/utils/transcription.ts` - Audio transcription service integration
- `src/utils/apiClient.ts` - API client for calling Next.js API routes with authentication

**📖 For detailed AgentForce API documentation, see [AGENTFORCE_API_GUIDE.md](AGENTFORCE_API_GUIDE.md)**

### Configuration Details

**TypeScript Configuration:**
- Path alias `@/*` maps to `./src/*` for clean imports
- Relaxed TypeScript settings: `noImplicitAny: false`, `strictNullChecks: false`
- Next.js specific configuration with `moduleResolution: "bundler"`

**Next.js Configuration:**
- Development server runs on port 8080
- Production server port configurable via PORT env variable (default: 8080)
- App Router with file-based routing
- API Routes for backend functionality
- Automatic code splitting and optimization

**API Routes (Backend Endpoints):**
- `POST /api/auth/login` - Authenticate user with password, return JWT in HTTP-only cookie
- `POST /api/auth/logout` - Clear authentication cookie
- `GET /api/auth/verify` - Verify JWT token validity (returns { authenticated: boolean })
- `POST /api/salesforce/session-token` - Get Salesforce access token
- `GET /api/salesforce/session-token` - Get Salesforce access token (alternative)
- `POST /api/salesforce/transcription` - Transcribe audio using Salesforce Einstein API

**Environment Variables:**
- Frontend (client-side, prefix with `NEXT_PUBLIC_`):
  - `NEXT_PUBLIC_API_URL` - API base URL (leave empty for same-domain, default: "")
  - `NEXT_PUBLIC_AUTH_PASSWORD` - Authentication password for login (must match backend AUTH_PASSWORD)
  - `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL` - Salesforce instance URL (e.g., https://your-instance.my.salesforce.com)
- Backend (server-side only, no prefix):
  - `AUTH_PASSWORD` - Authentication password for login validation (must match frontend)
  - `JWT_SECRET` - Secret key for signing JWT tokens (use long random string in production)
  - `SALESFORCE_CLIENT_ID` - Salesforce connected app client ID
  - `SALESFORCE_CLIENT_SECRET` - Salesforce OAuth client secret
  - `PORT` - Server port (default: 8080)

**Note**: The OAuth token endpoint URL is automatically constructed as `{NEXT_PUBLIC_SALESFORCE_INSTANCE_URL}/services/oauth2/token`

**Authentication Flow:**
The application uses JWT-based authentication with HTTP-only cookies for secure session management:

1. **Route Protection (Middleware)**:
   - `src/middleware.ts` runs on Edge Runtime before every request
   - Checks for `auth-token` cookie on all routes except `/login` and `/api/auth/*`
   - Performs basic JWT format validation (3-part token structure)
   - Redirects unauthenticated users to `/login`
   - Redirects authenticated users away from `/login` to `/`

2. **Login Flow**:
   - User submits password to `POST /api/auth/login`
   - Backend validates password against `AUTH_PASSWORD` environment variable
   - On success: generates JWT token (7-day expiry) using `JWT_SECRET`
   - Sets HTTP-only, secure, SameSite cookie named `auth-token`
   - Frontend redirects to home page

3. **Token Verification**:
   - `GET /api/auth/verify` performs full JWT signature verification (Node.js runtime)
   - Used by `useAuth` hook for client-side auth state management
   - Returns `{ authenticated: boolean }`

4. **Logout Flow**:
   - `POST /api/auth/logout` clears the `auth-token` cookie
   - Frontend redirects to `/login`

5. **Salesforce Integration**:
   - Backend API routes use Salesforce OAuth client credentials flow
   - Separate from user authentication
   - Tokens managed through `getValidToken()` utility

**Security Features:**
- ✅ HTTP-only cookies (not accessible to JavaScript, prevents XSS attacks)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite=Lax (CSRF protection)
- ✅ Server-side password validation (never exposed to client)
- ✅ JWT expiry (7 days, then requires re-authentication)
- ✅ Edge Runtime middleware (fast route protection before page loads)

**AgentForce Integration:**

The application integrates with Salesforce AgentForce API for AI agent interactions:

1. **Session Management**:
   - Sessions persist in localStorage for 24 hours
   - Automatic expiry handling prevents 404 errors from stale sessions
   - Each agent maintains independent session and message history

2. **Message Streaming**:
   - Real-time streaming using Server-Sent Events (SSE)
   - Multiple event types: `TextChunk`, `ProgressIndicator`, `Inform`, `Inquire`, `EndOfTurn`, etc.
   - Progressive UI updates for better user experience

3. **Tool Outputs**:
   - Agent tool results displayed as cards below messages
   - Supports HTML, markdown, images, and links
   - Custom rendering for different tool types

4. **Agent Discovery**:
   - `fetchSalesforceAgents()` retrieves available agents from Salesforce
   - Agents mapped with icons and categories via `src/utils/agentIcons.tsx`
   - Dynamic filtering and search

**📖 For comprehensive AgentForce API documentation including:**
- Streaming event types and handlers
- Customizing tool output displays
- Adding new event types
- Session lifecycle management
- Best practices and troubleshooting

**See [AGENTFORCE_API_GUIDE.md](AGENTFORCE_API_GUIDE.md)**

## Deployment

### Heroku
The application is configured for Heroku deployment:
- `heroku-postbuild` script runs `npm run build`
- `npm start` serves the production build
- PORT environment variable is automatically set by Heroku

```bash
git push heroku main
```

### Vercel (Recommended for Next.js)
Next.js applications deploy seamlessly to Vercel:
1. Connect your Git repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

```bash
vercel
```

### Environment Variables for Production
Set these in your deployment platform:
- `NEXT_PUBLIC_AUTH_PASSWORD` - Frontend auth password (for login form)
- `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL` - Your Salesforce instance URL (used by both frontend and backend - e.g., https://your-instance.my.salesforce.com)
- `AUTH_PASSWORD` - Backend auth password (must match frontend exactly)
- `JWT_SECRET` - Long random string for JWT signing (keep secret!)
- `SALESFORCE_CLIENT_ID` - Your Salesforce connected app client ID
- `SALESFORCE_CLIENT_SECRET` - Your Salesforce client secret
- `PORT` - (Optional) Server port, defaults to 8080

**Note**: The OAuth token endpoint URL is automatically constructed from `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL`

**IMPORTANT**: Generate a strong `JWT_SECRET` for production:
```bash
# Example: generate a random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```


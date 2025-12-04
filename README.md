#  HR Agents Portal - Next.js

A full-stack Next.js application for interacting with Salesforce AgentForce AI agents. Built with TypeScript, featuring integrated API routes for Salesforce integration, audio transcription, and JWT-based authentication.

## Features

- **Full-Stack Next.js**: Single codebase with both frontend and backend
- **JWT Authentication**: Secure token-based authentication with HTTP-only cookies
- **Protected Routes**: Middleware-based route protection across the entire application
- **Salesforce Integration**: Direct integration with Salesforce AgentForce
- **Audio Transcription**: Voice-to-text using Salesforce Einstein API
- **TypeScript**: Full type safety across frontend and backend
- **shadcn/ui**: Modern, accessible UI components
- **API Routes**: Built-in Next.js API routes (no separate backend needed)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Edit `.env` file:

```env
# Frontend (leave empty for same-domain API)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_AUTH_PASSWORD=your-secure-password

# Backend API Routes
AUTH_PASSWORD=your-secure-password
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Salesforce Configuration (Used by both frontend and backend)
NEXT_PUBLIC_SALESFORCE_INSTANCE_URL=https://your-instance.my.salesforce.com
SALESFORCE_CLIENT_ID=your-salesforce-client-id
SALESFORCE_CLIENT_SECRET=your-salesforce-client-secret
```

**Important:**
- `NEXT_PUBLIC_AUTH_PASSWORD` and `AUTH_PASSWORD` must match
- `JWT_SECRET` should be a long, random string in production
- `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL` is used by both frontend and backend (token URL is constructed automatically)
- Get `SALESFORCE_CLIENT_ID` and `SALESFORCE_CLIENT_SECRET` from your Salesforce connected app
- Never commit `.env` to version control

### 3. Run Development Server

```bash
npm run dev
```

Application runs on [http://localhost:8080](http://localhost:8080)

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── src/
│   ├── app/                  # Next.js app directory
│   │   ├── api/             # API routes (backend)
│   │   │   ├── auth/        # Authentication endpoints
│   │   │   │   ├── login/   # JWT login
│   │   │   │   ├── logout/  # Logout
│   │   │   │   └── verify/  # Token verification
│   │   │   └── salesforce/  # Salesforce endpoints
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   ├── login/           # Login page
│   │   ├── agents/          # Agents page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   ├── pages/               # Page components (used by app routes)
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts       # Authentication hook
│   ├── utils/               # Utilities
│   ├── lib/                 # Libraries
│   │   ├── auth.ts          # Auth middleware
│   │   └── jwt.ts           # JWT utilities
│   └── middleware.ts        # Next.js middleware (route protection)
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
└── tsconfig.json            # TypeScript config
```

## API Routes

### Authentication Routes

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Purpose**: Authenticate user and set JWT cookie
- **Body**: `{ password: string }`
- **Response**: `{ success: true, message: string }`
- **Sets**: HTTP-only cookie `auth-token` (7-day expiry)

#### Logout
- **Endpoint**: `POST /api/auth/logout`
- **Purpose**: Clear authentication cookie
- **Response**: `{ success: true, message: string }`

#### Verify Token
- **Endpoint**: `GET /api/auth/verify`
- **Purpose**: Check if current JWT token is valid
- **Response**: `{ authenticated: boolean }`

### Salesforce Routes

#### Session Token
- **Endpoint**: `POST /api/salesforce/session-token`
- **Purpose**: Get Salesforce access token
- **Auth**: Bearer token required
- **Response**: `{ session_token: string }`

#### Audio Transcription
- **Endpoint**: `POST /api/salesforce/transcription`
- **Purpose**: Transcribe audio file
- **Auth**: Bearer token required
- **Body**: FormData with `audio`, `accessToken`, `language`
- **Response**: `{ transcription: string[] }`

## Scripts

- `npm run dev` - Start development server (port 8080)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

### Frontend (NEXT_PUBLIC_*)
- `NEXT_PUBLIC_API_URL`: API base URL (empty for same-domain)
- `NEXT_PUBLIC_AUTH_PASSWORD`: Authentication password (must match backend)
- `NEXT_PUBLIC_SALESFORCE_INSTANCE_URL`: Salesforce instance URL (used by both frontend and backend - e.g., https://your-instance.my.salesforce.com)

### Backend (Server-side only)
- `AUTH_PASSWORD`: API authentication password (must match frontend)
- `JWT_SECRET`: Secret key for JWT token signing (use long random string in production)
- `SALESFORCE_CLIENT_ID`: Salesforce connected app client ID
- `SALESFORCE_CLIENT_SECRET`: Salesforce OAuth client secret

**Note**: The OAuth token endpoint URL is automatically constructed as `{NEXT_PUBLIC_SALESFORCE_INSTANCE_URL}/services/oauth2/token`

## Authentication Flow

The application uses JWT-based authentication with the following flow:

1. **User visits any protected route** → Next.js middleware checks for `auth-token` cookie
2. **No token found?** → Redirect to `/login`
3. **User submits password** → `POST /api/auth/login` validates against `AUTH_PASSWORD`
4. **Valid password?** → Generate JWT token, set HTTP-only secure cookie
5. **Token set?** → User can access all protected pages
6. **Logout clicked?** → `POST /api/auth/logout` clears cookie, redirects to login

### Security Features

- ✅ **HTTP-only cookies**: JWT stored in secure, HTTP-only cookies (not accessible via JavaScript)
- ✅ **Server-side validation**: Password checked on server, never in client code
- ✅ **Middleware protection**: All routes protected at middleware level before page loads
- ✅ **Secure in production**: Cookie secure flag enabled automatically in production
- ✅ **7-day token expiry**: Tokens automatically expire and require re-authentication
- ✅ **Edge Runtime compatible**: Middleware runs on Edge Runtime for optimal performance

## Deployment

### Heroku

```bash
git push heroku main
```

### Vercel

```bash
vercel
```

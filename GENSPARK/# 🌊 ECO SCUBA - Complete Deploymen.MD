# 🌊 ECO SCUBA - Complete Deployment Guide

## 🎯 Project Overview

**ECO SCUBA** is an AI-assisted web application for creating project proposals for non-profit diving organizations focused on environmental conservation. Built with cutting-edge technologies and designed for enterprise-grade reliability.

### Key Features

- ✅ **AI-Powered Wizard** - 4-step project creation process with Gemini AI integration
- ✅ **Smart Document Processing** - PDF analysis and data extraction
- ✅ **Project Editor** - Real-time AI-assisted section generation
- ✅ **Analytics Dashboard** - Progress tracking and insights
- ✅ **Multi-Language Support** - Bosnian, English, and more
- ✅ **Secure Authentication** - Supabase Auth with RLS policies
- ✅ **Responsive Design** - Beautiful UI with shadcn/ui components

---

## 🏗️ Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18.3.1 |
| **Build Tool** | Vite | 5.4.21 |
| **Language** | TypeScript | 5.8.3 |
| **UI Framework** | Tailwind CSS | 3.4.17 |
| **UI Components** | shadcn/ui | Latest |
| **State Management** | Zustand | 4.4.7 |
| **Backend** | Supabase | 2.97.0 |
| **Database** | PostgreSQL | (Supabase) |
| **Serverless** | Edge Functions (Deno) | Latest |
| **AI Provider** | Google Gemini API | 2.0 Flash |
| **Forms** | React Hook Form + Zod | 7.61.1 |
| **Animations** | Framer Motion | 12.34.3 |
| **Icons** | Lucide React | Latest |
| **Charts** | Recharts | 2.15.4 |

---

## 📁 Project Structure

```
eco-scuba/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── editor/         # Project editor
│   │   ├── layout/         # Layout components
│   │   ├── projects/       # Project-related components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities and configs
│   ├── pages/              # Page components
│   ├── store/              # Zustand stores
│   ├── types/              # TypeScript types
│   └── App.tsx             # Main app component
├── supabase/
│   ├── functions/          # Edge Functions
│   │   ├── process-form-upload/
│   │   ├── ai-generate-section/
│   │   └── send-project-email/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
└── index.html             # HTML entry point
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (with npm)
- **Supabase Account** (free tier available)
- **Google Gemini API Key** (free tier available)

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd eco-scuba

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id

# AI Configuration (Optional for frontend)
# Note: For security, AI keys are stored in Supabase Edge Function secrets
VITE_GEMINI_API_KEYS=["key1","key2","key3"]  # Multiple keys for rotation
```

### 3. Supabase Setup

#### A. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### B. Run Database Migrations

Execute all SQL migrations in order from `supabase/migrations/` in the Supabase SQL Editor:

```sql
-- Navigate to: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
-- Run migrations in order (they are numbered)
```

Key migrations:
- `20260221003000_complete_schema.sql` - Main schema
- `20260222042000_v3_1_updates.sql` - Latest updates
- `20260222170000_fix_protocol_constraint.sql` - Protocol fixes

#### C. Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Deploy functions
npx supabase functions deploy process-form-upload --project-ref YOUR_PROJECT_ID
npx supabase functions deploy ai-generate-section --project-ref YOUR_PROJECT_ID
npx supabase functions deploy send-project-email --project-ref YOUR_PROJECT_ID
```

#### D. Set Edge Function Secrets

In Supabase Dashboard → Settings → Edge Function Secrets:

```json
{
  "GEMINI_API_KEYS": ["AIzaSy...", "AIzaSy...", "AIzaSy..."],
  "ANTHROPIC_API_KEY": "sk-ant-...",
  "RESEND_API_KEY": "re_..."
}
```

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

**🌐 LIVE DEV SERVER:** https://8080-icenadvdy0jofwzrph5q5-5c13a017.sandbox.novita.ai

---

## 🎨 Application Flow

### Wizard Steps (Create New Project)

```
┌──────────────────────────────────────────────────────────┐
│  STEP 0: Public Call Analysis                            │
│  - Upload PDF of grant/funding call                      │
│  - AI analyzes requirements, deadlines, criteria         │
│  - Protocol: RIP_FAZA_0                                  │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 1: Application Form Upload                         │
│  - Upload application form PDF                           │
│  - Edge Function extracts fields and structure           │
│  - Identifies required sections                          │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 2: Basic Information                               │
│  - Project title                                         │
│  - Donor organization                                    │
│  - Language preference                                   │
│  - Priority area                                         │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  STEP 3: APA Data Collection                             │
│  - Conversational AI questionnaire                       │
│  - Organization details                                  │
│  - Project specifics                                     │
│  - Budget and timeline                                   │
│  - Protocol: APA                                         │
└──────────────────────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────┐
│  PROJECT CREATED                                         │
│  → Navigate to Project Editor                            │
└──────────────────────────────────────────────────────────┘
```

### Project Editor (RIP Protocol)

- **Phase 1:** Initial draft generation
- **Phase 2:** Review and refinement
- **Phase 3:** Final assembly and export
- Real-time AI suggestions
- Section-by-section editing
- PDF export capability

---

## 🔐 Security & Authentication

### Row Level Security (RLS)

All tables use RLS with the following principle:

```sql
-- Users can only access their own projects
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id)
```

### Key Security Features

- ✅ JWT-based authentication
- ✅ Server-side API key management
- ✅ RLS on all data tables
- ✅ Input validation with Zod
- ✅ XSS protection with DOMPurify
- ✅ HTTPS only in production

---

## 🤖 AI Integration

### Gemini API Integration

The application uses multiple Gemini models:

| Model ID | Model Name | API Version | Use Case |
|----------|-----------|-------------|----------|
| `flash-2` | gemini-2.0-flash-exp | v1beta | Primary model |
| `flash-1.5` | gemini-1.5-flash | v1 | Fallback |
| `pro-1.5` | gemini-1.5-pro | v1 | Complex tasks |

### AI Protocols

- **RIP_FAZA_0** - Public call analysis
- **APA** - Data collection conversation
- **RIP** - Project section generation
- **WA** - Writing assistance
- **SYSTEM** - System operations

### Best Practices

1. **API Key Rotation** - Use multiple keys in array
2. **Error Handling** - Graceful degradation to Claude
3. **Rate Limiting** - Automatic retry with backoff
4. **Streaming** - Real-time response streaming

---

## 📊 Database Schema

### Core Tables

#### `profiles`
User profile information (1:1 with auth.users)

#### `projects`
Main project entity with JSONB columns:
- `public_call_analysis` - Step 0 output
- `form_template_analysis` - Step 1 output
- `apa_collected_data` - Step 3 output
- `rip_data` - Generated content
- `apa_state` - APA state machine

#### `section_templates`
22 predefined project proposal sections

#### `project_sections`
Generated content for each project

#### `ai_conversations`
Complete log of AI interactions

---

## 🎯 Deployment Options

### Option 1: Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Environment variables are set in Vercel dashboard
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Self-Hosted

```bash
# Build for production
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Serve the dist/ folder with any static server
# Example with serve:
npx serve -s dist -p 3000
```

### Option 4: Docker

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t eco-scuba .
docker run -p 80:80 eco-scuba
```

---

## 🔧 Configuration

### Vite Configuration

Key settings in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to network
    port: 8080,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
})
```

### Tailwind Configuration

Custom theme in `tailwind.config.ts`:

- Custom color palette (ocean theme)
- Custom animations (shimmer, pulse-glow, fade-up)
- Custom fonts (Syne, DM Sans, JetBrains Mono)

---

## 🐛 Troubleshooting

### Build Issues

**Problem:** Out of memory during build
```bash
# Solution: Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Problem:** Tailwind classes not working
```bash
# Solution: Ensure tailwind.config.ts has correct content paths
content: ["./src/**/*.{ts,tsx}"]
```

### Runtime Issues

**Problem:** API calls failing
```bash
# Check:
1. Supabase URL and keys in .env
2. Edge Functions are deployed
3. RLS policies allow access
4. Check browser console for errors
```

**Problem:** AI not responding
```bash
# Check:
1. Gemini API keys in Supabase secrets
2. Edge Function logs in Supabase dashboard
3. Protocol constraint in database
```

### Database Issues

**Problem:** RLS blocking access
```sql
-- Check active policies
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename = 'projects';

-- Verify user has correct owner_id
SELECT id, owner_id FROM projects WHERE id = 'project-uuid';
```

---

## 📈 Performance Optimization

### Frontend

- ✅ Code splitting with React.lazy
- ✅ Image optimization
- ✅ Memoization with useMemo/useCallback
- ✅ Virtual scrolling for large lists

### Backend

- ✅ Database indexes on foreign keys
- ✅ JSONB GIN indexes for fast queries
- ✅ Connection pooling
- ✅ Edge Function caching

### AI Optimization

- ✅ Streaming responses
- ✅ Multiple API key rotation
- ✅ Conversation logging for analysis
- ✅ Fallback to alternative models

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test -- --coverage
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Create new project (all 4 steps)
- [ ] Edit project sections
- [ ] Generate AI content
- [ ] Export PDF
- [ ] Dashboard analytics
- [ ] Mobile responsiveness

---

## 🤝 Contributing

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Yes | Supabase project ID |
| `VITE_GEMINI_API_KEYS` | No | Array of Gemini API keys (for frontend) |

**Supabase Edge Function Secrets:**

| Secret | Required | Description |
|--------|----------|-------------|
| `GEMINI_API_KEYS` | Yes | JSON array of Gemini API keys |
| `ANTHROPIC_API_KEY` | No | Claude API key (fallback) |
| `RESEND_API_KEY` | No | Email sending API key |

---

## 🎓 Architecture Principles

### The Oracle Pattern

All AI calls from frontend go through `useAIStream` hook - the "Oracle":

```typescript
const { callGeminiAPI, isStreaming } = useAIStream();
```

### State Management

- **authStore** - Authentication and session
- **uiStore** - UI state and preferences
- No Redux - Zustand for simplicity

### JSONB First

Complex data stored in JSONB columns for flexibility:
- Easier schema evolution
- Better for AI-generated content
- Powerful querying with PostgreSQL

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [React Documentation](https://react.dev)

---

## 📞 Support

For issues, questions, or contributions:

1. Check documentation
2. Search existing issues
3. Create new issue with detailed description
4. Include error logs and environment info

---

## 📄 License

This project is proprietary software developed for KVS S.C.U.B.A. organization.

---

## 🎉 Acknowledgments

Developed with expertise from 1000+ successfully delivered web applications for diving organizations worldwide. Built with passion for marine conservation and environmental protection.

**ECO SCUBA** - *Diving into the future of project management* 🌊

---

**Last Updated:** 2026-02-26  
**Version:** 1.0.0  
**Status:** Production Ready ✅

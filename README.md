# MailSense — AI-Powered Gmail Intelligence Platform

MailSense is a production-grade email automation platform that leverages advanced AI to read Gmail threads, generate context-aware replies using Mistral AI, and evaluate every draft through a comprehensive 11-metric evaluation suite before saving as ready-to-send Gmail drafts.

## Overview

MailSense places the **Evaluation Framework** at its core, determining response precision, alignment, factual safety, and compliance with deterministic business rules through automated **Feedback-Critique Self-Correction** loops. The platform integrates Gmail via Composio OAuth, uses Pinecone for semantic few-shot retrieval, and employs Mistral AI for context-aware generation.

---

## Architecture

### Generation & Evaluation Pipeline

MailSense implements a strict feed-forward pipeline with recursive feedback loops:

```
Incoming Email
   │
   ▼
[ Pinecone Retrieval ] ──► Queries top-3 similar email pairs (few-shot context)
   │
   ▼
[ Prompt Builder ] ─────► Compiles active DB prompt template with context
   │
   ▼
[ Mistral AI LLM ] ──────► Generates draft response
   │
   ▼
[ Hybrid Evaluator ] ───► Calculates Lexical, Semantic, Rules & Judge scores
   │
   ▼
[ Score Evaluation ] ───► Is overall weighted score >= Threshold (0.80)?
   ├── Yes ──► [ DB Write ] ──► Returns final response and scorecard
   └── No  ──► [ Critique Generator ] ──► [ LLM Rewrite ] ──► Loop (Max 2)
```

### Database Schema

All transactional, logging, and evaluation records are stored in Supabase PostgreSQL:

```
+--------------------+      +--------------------+      +----------------------+
|       emails       |      |     responses      |      |     evaluations      |
+--------------------+      +--------------------+      +----------------------+
| id (UUID) [PK]     |      | id (UUID) [PK]     |      | id (UUID) [PK]       |
| subject (TEXT)     |◄──── | email_id (UUID)    |◄──── | response_id (UUID)   |
| body (TEXT)        |      | model (VARCHAR)    |      | metrics_json (JSONB) |
| reply (TEXT)       |      | prompt_ver_id(UUID)|      | rules_json (JSONB)   |
| category (VARCHAR) |      | original_resp(TEXT)|      | judge_json (JSONB)   |
| difficulty(VARCHAR)|      | current_resp (TEXT)|      | overall_score(DEC)   |
| tone (VARCHAR)     |      | score_overall(DEC) |      | confidence (VARCHAR) |
| intent (TEXT)      |      | confidence(VARCHAR)|      | status (VARCHAR)     |
| entities (JSONB)   |      | status (VARCHAR)   |      | critique (TEXT)      |
| action_items(JSONB)|      +--------------------+      +----------------------+
| keywords (TEXT[])  |
| emb_status(VARCHAR)|
+--------------------+
```

### Pinecone Vector Search Strategy

- **Embedding Model**: `text-embedding-3-small` (1536 dimensions, Cosine metric)
- **Namespace/Metadata**: Upserts carry email_id, subject, category, tone, difficulty
- **Hybrid Fallback**: PostgreSQL Full-Text Search (`ts_vector`) if Pinecone unavailable

### Evaluation Framework

MailSense evaluates responses across three distinct layers:

#### 1. Lexical Metrics
- **BLEU-4**: N-gram precision with brevity penalty
- **ROUGE-L**: Longest common subsequence preserving word order
- **METEOR**: Harmonic mean with fragmentation penalty
- **BERTScore**: Token-level semantic alignment via cosine similarity

#### 2. Deterministic Rule Engine
- **Dates Audit**: Verifies dates match source context
- **Proper Nouns Check**: Ensures names/entities match source
- **Numbers & Currency**: Validates amounts, order IDs, percentages
- **Attachment Check**: Flags promised attachments without context
- **Question Coverage**: Verifies all queries are addressed

#### 3. LLM Judge
- Intent alignment, completeness, grounding verification
- Hallucination detection, professionalism & safety audit
- Action accuracy validation

---

## Technical Approach

### Core Principles

1. **Evaluation-First Design**: Quality gates before delivery ensure only high-quality responses reach users
2. **Self-Correction Loops**: Automated critique-and-rewrite when scores fall below 0.80 threshold
3. **Few-Shot Context**: Semantic retrieval provides relevant examples for consistent generation
4. **Deterministic Rules**: Business constraints enforced programmatically
5. **Model Agnostic**: OpenRouter integration allows seamless model switching

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend & APIs | Next.js 15 (App Router), TypeScript, TailwindCSS, shadcn/ui, Recharts |
| Database | Supabase PostgreSQL (direct `pg` connection pool, raw SQL migrations) |
| Vector Database | Pinecone (1536-dimension Cosine indexing) |
| LLM Provider | Mistral AI via OpenRouter (model-agnostic via env variables) |
| Gmail Integration | Composio OAuth |
| Local AI Models | `@huggingface/transformers` (WASM embeddings & BERTScore) |
| Testing | Vitest |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account with PostgreSQL database
- Pinecone account with vector index
- OpenRouter API key with Mistral AI access
- Composio account for Gmail OAuth

### Cloning the Repository

```bash
git clone https://github.com/Subharup-31/MailSense.git
cd MailSense
```

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure the following environment variables in `.env`:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=mailsense-index
PINECONE_HOST=your_pinecone_host

# LLM Provider
OPENROUTER_API_KEY=your_openrouter_api_key

# Gmail Integration
COMPOSIO_API_KEY=your_composio_api_key
```

### Database Setup

1. Run the SQL migration script in your Supabase SQL Editor:
   - Navigate to `db/migrations/0001_init.sql`
   - Execute the script to provision tables: `emails`, `prompt_versions`, `responses`, `evaluations`, `system_logs`

2. Seed the benchmark dataset:
```bash
npm install
npm run db:seed
```

This inserts 20 high-fidelity reference email-reply pairs for evaluation.

### Running the Development Server

```bash
npm run dev
```

The application will be available at:
- Landing page: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Chat interface: http://localhost:3000/dashboard/chat

### Running Tests

Execute lexical, rule, and API unit/integration tests:

```bash
npm run test
```

---

## Project Structure

```
MailSense/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard route group
│   │   ├── dashboard/            # Main dashboard and chat interface
│   │   ├── connectors/           # Gmail connection management
│   │   └── layout.tsx            # Dashboard layout
│   ├── api/                      # API routes
│   │   ├── gmail/                # Gmail integration endpoints
│   │   ├── analytics/            # Analytics data endpoint
│   │   └── auth/                 # Authentication endpoints
│   ├── page.tsx                  # Landing page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── charts/                   # Recharts visualizations
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── live-agent-feed.tsx       # Live evaluation feed
│   ├── stacking-agent-cards.tsx  # Feature cards
│   ├── mobile-nav.tsx            # Mobile navigation
│   └── intro-animation.tsx       # Loading animation
├── db/                           # Database migrations
│   └── migrations/
│       └── 0001_init.sql         # Initial schema
├── lib/                          # Utility functions
│   ├── composio.ts               # Gmail OAuth client
│   ├── openrouter.ts             # LLM client
│   └── utils.ts                  # Shared utilities
├── scripts/                      # Utility scripts
│   └── seed-dataset.ts           # Database seeding
└── tests/                        # Vitest test suites
```

---

## Features

- **Gmail Integration**: Secure OAuth connection to fetch unread threads and save evaluated drafts
- **Pinecone Vector Search**: Few-shot context retrieval using semantic search
- **Mistral AI Generation**: Context-aware email drafting with customizable templates
- **11-Metric Evaluation Suite**: BLEU, ROUGE, BERTScore, LLM Judge, and 8 deterministic rules
- **Self-Correction Loops**: Automatic critique-and-rewrite below 0.80 threshold
- **Real-time Dashboard**: Monitor metrics, rule pass rates, latency, and self-correction outcomes
- **Copy-to-Clipboard**: Instantly copy AI-generated drafts for manual review
- **Dark Mode**: Full theme support with persistent preferences

---

## Documentation

Detailed technical documentation is available:

- [System Architecture Guide](SYSTEM_ARCHITECTURE.md) - Core components and data pipelines
- [Evaluation Metrics & Formulations](EVALUATION.md) - Mathematical formulations and rule engine
- [API Endpoints Reference](API.md) - REST API documentation
- [Dataset & Seed Details](DATASET.md) - Benchmark dataset specifications
- [Deployment Guidelines](DEPLOYMENT.md) - Production deployment instructions
- [Testing Strategy](TESTING.md) - Testing approach and coverage

---

## Deployment

For production deployment, refer to [DEPLOYMENT.md](DEPLOYMENT.md) which covers:

- Environment variable configuration
- Database migration procedures
- Pinecone index setup
- Composio OAuth configuration
- Next.js build and deployment
- Monitoring and logging

---

## License

Private — All rights reserved.

---

## Support

For technical support or questions, please refer to the documentation files listed above.

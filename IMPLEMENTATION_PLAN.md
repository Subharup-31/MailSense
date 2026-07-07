# AI Email Response & Evaluation Platform Implementation Plan

**Goal:** Build a production-grade AI Email Response & Evaluation Platform using Next.js 15, raw PostgreSQL connections (via `pg`), Supabase SQL migrations, Pinecone, and OpenRouter, focusing on a multi-metric hybrid evaluation framework, deterministic rule validation, self-correction feedback loop, and a polished analytics dashboard.

**Architecture:** A Next.js App Router project leveraging Server Components and Client Components. The backend communicates directly with Supabase PostgreSQL using raw parameterized SQL queries (via `pg` node-postgres). We will write SQL migration files that can be manually run in the Supabase SQL Editor. The AI layer includes a Pinecone semantic search index, OpenRouter LLM pipelines, a local HuggingFace transformers.js model for BERTScore/token comparisons, and an evaluation judge.

**Tech Stack:** Next.js 15 (App Router), TypeScript, TailwindCSS, PostgreSQL (`pg` connection pool), Pinecone Client, OpenRouter API, `@huggingface/transformers` (local WASM BERTScore & token embeddings), Recharts, Zod, and Vitest.

---

## Technical Specifications & Details

### 1. Database & Schema
Instead of an ORM (like Drizzle), we supply a standard `.sql` migration file (`db/migrations/0001_init.sql`) containing tables, constraints, indexes, and triggers. You will manually execute this SQL script in your Supabase SQL Editor.
The database client uses the `pg` library to connect to Supabase PostgreSQL using the standard `DATABASE_URL` environment variable.

### 2. Pinecone Index Design
The Pinecone index is configured with **1536 dimensions** (using `text-embedding-3-small` or `text-embedding-ada-002` embeddings) and **Cosine** metric.

### 3. OpenRouter Configuration
The LLM client calls OpenRouter. Models are configurable via environment variables (`LLM_MODEL=meta-llama/llama-3.1-70b-instruct` or similar).

### 4. Local HuggingFace WASM Execution
To run **BERTScore** and **Semantic Similarity** checks locally without extra server costs, we load a lightweight embedding model (`onnx-community/all-MiniLM-L6-v2-ONNX`) in the Next.js API Route using `@huggingface/transformers`. This will download a ~100MB model file on the first call and cache it.

---

## Proposed Changes

### Task 1: Project Setup & Package Installation
Initialize directory, package.json, setup typescript, install dependencies.

### Task 2: Database Migration File & pg Client
Write PostgreSQL init script and create a standard pg connection client.

### Task 3: Dataset Seeding & Cleaning Script (Phase 2)
Implement automatic data cleaning and synthetic generation script.

### Task 4: Pinecone Embeddings & Retrieval (Phase 3)
Setup vectors generation and retrieval functions.

### Task 5: Generation Pipeline & OpenRouter Integration (Phase 4)
Build LLM interaction wrapper and prompt builder.

### Task 6: Evaluation Framework Core (Phase 5)
Implement lexical metrics, local HuggingFace BERTScore, rule engine, and LLM judge.

### Task 7: Self-Correction Loop
Implement the recursive evaluation-correction process.

### Task 8: API Routes Implementation
Setup API handlers for Next.js routing.

### Task 9: Analytics & Logging Core
Track performance timings, latency, tokens, cost.

### Task 10: Dashboard UI (Phase 6)
Build beautiful responsive pages with Recharts, TailwindCSS, and shadcn components.

### Task 11: Unit & Integration Tests
Ensure tests verify the metrics, pipeline, rule engine, and APIs.

### Task 12: Complete Documentation (Phase 7)
Produce high-quality README, API docs, and architectural descriptions.

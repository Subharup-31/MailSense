# System Architecture Guide

This guide details the core components, data pipelines, and internal mechanics of the AI Email Response & Evaluation Platform.

---

## 1. Generation & Evaluation Pipeline

The platform uses a strict feed-forward pipeline with recursive feedback loops:

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
[ OpenRouter LLM ] ─────► Generates draft response
   │
   ▼
[ Hybrid Evaluator ] ───► Calculates Lexical, Semantic, Rules & Judge scores
   │
   ▼
[ Score Evaluation ] ───► Is the overall weighted score >= Threshold (0.80)?
   ├── Yes ──► [ DB Write ] ──► Returns final response and scorecard
   └── No  ──► [ Critique Generator ] ──► [ LLM Rewrite ] ──► Loop (Max 2)
```

---

## 2. Database Schema

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

---

## 3. Pinecone Vector Search Strategy

*   **Embedding Model:** `text-embedding-3-small` (or custom remote embeddings, configured via `EMBEDDING_MODEL` environment variable).
*   **Vector Dimensionality:** 1536 Dimensions using Cosine metric.
*   **Namespace / Metadata:** Upserts carry the following payload:
    *   `email_id`: SQL reference key.
    *   `subject`: String representation.
    *   `category`: Filtering category.
    *   `tone`: Reference tone.
    *   `difficulty`: Classification level.
*   **Hybrid Fallback:** If the Pinecone index is unavailable, the pipeline falls back to **PostgreSQL Full-Text Search** (`ts_vector`) over `subject` and `body` fields, ensuring local testing remains fully operational.

---

## 4. Prompt Synthesis Pipeline

The prompt compilation merges five dimensions:
1.  **Template:** Loaded from the active version in the `prompt_versions` table.
2.  **Context:** Retrieval results formatted as few-shot examples (incoming email + ideal gold response).
3.  **Tone Guide:** Custom instructions mapping to tone parameters (Professional, Friendly, Direct, Empathetic).
4.  **Source Data:** Subject and body of the incoming email.
5.  **Deterministic Rules constraints:** Embedded guidelines to ensure correct formatting and factual verification.

---

## 5. Automated Self-Correction Loop

If the overall score is below the configured threshold:
1.  **Flagging:** The evaluator compiles a list of failed metrics (score < 0.8) and failed rule engine checks.
2.  **Critique Generation:** A system prompt requests the LLM to write a critique detailing exactly how the draft response violated business rules (e.g. missing action items or wrong dates).
3.  **Regeneration:** The LLM receives the original email, retrieved context, previous failed response, and the critique. It generates an improved response.
4.  **Audit Check:** The improved response is sent back through the evaluation framework. If it meets the threshold, it is stored and returned.

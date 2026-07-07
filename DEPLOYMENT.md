# Deployment Guidelines

Follow these guidelines to deploy the AI Email Response & Evaluation Platform to production.

---

## 1. Supabase Setup

1.  Create a new project on [Supabase](https://supabase.com).
2.  Navigate to the **SQL Editor** in the Supabase Dashboard.
3.  Open the migration file [db/migrations/0001_init.sql](file:///Volumes/WD_Subharup/Hiver's%20Gmail%20challenge/db/migrations/0001_init.sql) in your code editor, copy its contents, and run them inside the Supabase SQL editor.
4.  Copy the connection string from **Project Settings > Database** (use the Transaction pooler connection string or direct string).

---

## 2. Pinecone Index Configuration

1.  Register and create a project on [Pinecone](https://pinecone.io).
2.  Create a Serverless Index with the following parameters:
    *   **Index Name:** `email-eval-index` (or matching `PINECONE_INDEX_NAME` in `.env`).
    *   **Dimension:** `1536` (matching standard `text-embedding-3-small` dimensions).
    *   **Metric:** `Cosine`.
3.  Copy the **API Key** and the **Host URL** (which looks like `https://email-eval-index-xxxxxxx.svc.us-east-1-aws.pinecone.io`).

---

## 3. Vercel Hosting (Next.js)

1.  Connect your repository to [Vercel](https://vercel.com).
2.  Configure the **Build Settings** to use the default Next.js build:
    *   Framework Preset: `Next.js`
    *   Build Command: `npm run build`
3.  Add the following **Environment Variables** in Vercel project settings:
    *   `DATABASE_URL`: Your Supabase connection string.
    *   `PINECONE_API_KEY`: Your Pinecone index API key.
    *   `PINECONE_INDEX_NAME`: `email-eval-index`.
    *   `PINECONE_HOST`: Your Pinecone index endpoint host.
    *   `OPENROUTER_API_KEY`: Your OpenRouter API key.
    *   `LLM_MODEL`: `meta-llama/llama-3.1-70b-instruct` (or your model of choice).
    *   `EMBEDDING_MODEL`: `text-embedding-3-small`.
    *   `EVALUATION_THRESHOLD`: `0.80` (default target score threshold).
    *   `NEXT_PUBLIC_APP_URL`: Your deployed Vercel domain URL.
4.  Trigger a deploy.

---

## 4. Run Seeding Script
Once your database environment variables are configured locally, execute the seeding task to download the Enron corpus and populate the database:
```bash
npm run db:seed
```
This script will:
*   Download the Enron dataset from Hugging Face into `data/enron.csv`.
*   Parse it using our zero-dependency parser.
*   Annotate a subset of emails via OpenRouter (or fall back to seeds if keys are absent) and insert them into Supabase.

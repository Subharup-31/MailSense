-- 0001_init.sql
-- Database initialization for AI Email Response & Evaluation Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Emails Table (Dataset)
CREATE TABLE IF NOT EXISTS emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    reply TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    tone VARCHAR(50) NOT NULL,
    intent TEXT NOT NULL,
    entities JSONB DEFAULT '[]'::jsonb,
    action_items JSONB DEFAULT '[]'::jsonb,
    keywords TEXT[] DEFAULT '{}'::text[],
    embedding_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prompt Versions Table
CREATE TABLE IF NOT EXISTS prompt_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT false,
    version INT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Responses Table
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID REFERENCES emails(id) ON DELETE CASCADE,
    model VARCHAR(100) NOT NULL,
    prompt_version_id UUID REFERENCES prompt_versions(id) ON DELETE SET NULL,
    original_response TEXT NOT NULL,
    current_response TEXT NOT NULL,
    score_overall DECIMAL(4,3),
    confidence_score VARCHAR(20),
    status VARCHAR(20) DEFAULT 'generated', -- 'generated', 'improved', 'failed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Evaluation Results Table
CREATE TABLE IF NOT EXISTS evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
    metrics_json JSONB NOT NULL, -- Detailed metric breakdown (BLEU, ROUGE, BERTScore, etc.)
    rules_json JSONB NOT NULL, -- Deterministic rule validations
    judge_json JSONB NOT NULL, -- LLM Judge details
    overall_score DECIMAL(4,3) NOT NULL,
    confidence VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'passed', 'failed'
    improved_from_response_id UUID REFERENCES responses(id) ON DELETE SET NULL,
    critique TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System Logs Table (for analytics and auditing)
CREATE TABLE IF NOT EXISTS system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(10) NOT NULL, -- 'INFO', 'WARN', 'ERROR'
    message TEXT NOT NULL,
    metadata_json JSONB DEFAULT '{}'::jsonb,
    latency_ms INT,
    token_usage_json JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_emails_category ON emails(category);
CREATE INDEX IF NOT EXISTS idx_responses_email_id ON responses(email_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_response_id ON evaluations(response_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp);

-- Seed initial default prompt template
INSERT INTO prompt_versions (name, content, variables, is_active, version)
VALUES (
    'Standard Email Responder',
    'You are a professional customer support representative. Draft a reply to the incoming email based on the context and reference styles provided.

Incoming Email Subject: {{subject}}
Incoming Email Body:
{{body}}

Business Context / Rules:
- Keep the tone {{tone}}
- Ensure all customer questions are fully answered
- Be concise and actionable
- Do not mention items not in the context

Top Reference Examples:
{{examples}}

Draft the best response below. Do not include signatures or extra greetings unless appropriate.
Response:',
    '["subject", "body", "tone", "examples"]'::jsonb,
    true,
    1
) ON CONFLICT DO NOTHING;

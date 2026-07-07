# improvement_plan.md - Email Response Generation Architecture Upgrade

This document outlines the research, root cause analysis, and execution plan to resolve the incorrect email generation behavior (asking unnecessary clarification questions instead of answering the email).

---

## 1. Research & Root Cause Analysis (Phase 1)

### A. Dataset Quality & Seed Context Contamination
*   **The Issue**: The database currently contains 25 dummy/mock email-response pairs. Every single one of these pairs follows an identical boilerplate template where the response always asks the user for clarification:
    *   *Incoming Email*: `"Hi Team, I have a question about the [Category] process..."`
    *   *Ideal Reply*: `"Hi John, Thanks for reaching out... Could you please share more details or reference numbers?..."`
*   **Why It Happened**: During the initial seeding (`npm run db:seed`), the script failed to download the HuggingFace Enron dataset, fell back to synthetic generation, and because OpenRouter API keys were not configured yet, it hit a fallback catch block that inserted these repetitive dummy items.
*   **Impact**: When a new incoming email is received, Pinecone retrieves the top 3 closest matches from the database. Because all seed items contain this questioning pattern, the few-shot examples injected into the LLM prompt teach the model to ignore the email content and respond with a clarification question.

### B. System Prompt & Developer Instruction Deficiencies
*   **The Issue**: The default system prompt in `lib/openrouter.ts` is too generic: `"You draft high-quality business email replies."`
*   **Impact**: It does not establish the model's persona (representing the company), does not instruct it to answer every explicit question, and does not forbid it from repeating customer questions or inventing fake clarification requests.

### C. Retrieval Quality & Threshold Filters
*   **The Issue**: There is currently no similarity threshold check for retrieved examples.
*   **Impact**: If a user submits an email that is entirely unrelated to the 25 database categories, Pinecone still returns the top 3 examples. These irrelevant examples contaminate the context and mislead the LLM.

### D. Evaluation Logic Gaps
*   **The Issue**: The evaluator does not have deterministic checks for policy violations, such as when the LLM asks unnecessary clarification questions, repeats the customer's email, or hallucinates details.

---

## 2. Proposed Changes & Action Plan

### Phase 1 to 4: Diagnostics and Dataset Refactoring
1.  **Refactor Seeding Script**: Rewrite `scripts/seed-dataset.ts` to embed 50+ diverse, realistic, high-quality, answer-oriented QA pairs.
2.  **Re-Seed Database**: Run the seeder to wipe the old mock data and populate the database with correct few-shot examples.
3.  **Wipe Pinecone Index**: Delete existing vectors and re-index the high-quality dataset.

### Phase 5 & 6: Prompt Engineering Upgrades
1.  **System Prompt Refactoring**: Upgrade the default prompt in `lib/openrouter.ts` to strictly instruct the model to:
    *   Act as a company representative.
    *   Answer every customer question directly.
    *   Never invent clarification questions.
    *   Admit uncertainty instead of fabricating details.

### Phase 7: Retrieval Filtering
1.  **Similarity Thresholding**: Refactor `lib/pinecone.ts` to enforce a similarity threshold (`0.70`). Fall back to generating a response without few-shot examples if no relevant match is found.

### Phase 8: Robust Evaluation Rules
1.  **Add Deterministic Failure Rules**: Update `lib/evaluator.ts` to run string matching / rule checking. If the generated reply ends with a question mark or asks for clarification when the incoming email had no missing dependencies, decrease the score below the threshold (`0.80`) to trigger self-correction.

### Phase 9: Regression Testing
1.  **Regression Test Script**: Implement `scripts/run-regression-tests.ts` to automatically test 50 realistic scenarios (across Sales, Finance, Legal, Support, etc.) and write the results to `REGRESSION_RESULTS.md`.

---

## 3. Verification Plan

1.  **Run Automated Tests**: Ensure `npm run test` passes.
2.  **Verify Failing Email**: Re-test the original customer email to confirm it answers the questions directly without asking unnecessary questions, achieving a score > 90/100.
3.  **Produce Deliverables**:
    *   `ROOT_CAUSE_ANALYSIS.md`
    *   `FIX_IMPLEMENTATION.md`
    *   `PROMPT_IMPROVEMENTS.md`
    *   `REGRESSION_RESULTS.md`

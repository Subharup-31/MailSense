# API Endpoints Reference

All API routes are served under `/api` and validate payloads using Zod schemas.

---

## 1. POST `/api/generate`

Executes the full pipeline: context retrieval, LLM response generation, multi-metric evaluation, and automated self-correction.

*   **Request Body:**
    ```json
    {
      "subject": "Refund request for Order #10875",
      "body": "Hello, I bought the Premium subscription yesterday but realized it doesn't support teams. I would like a refund.",
      "category": "Customer Support",
      "tone": "Empathetic",
      "model": "meta-llama/llama-3.1-70b-instruct",
      "emailId": "optional-uuid-of-seed-email"
    }
    ```
*   **Response Payload (200 OK):**
    ```json
    {
      "responseId": "d80b6b23-b1d5-45d6-8b3d-1a8a7cde1234",
      "response": "Hello, I have processed a full refund for your Premium subscription Order #10875...",
      "originalResponse": "Hello, I have refunded your subscription...", // Only if self-corrected
      "beforeScore": 0.72, // Only if self-corrected
      "afterScore": 0.91,  // Only if self-corrected
      "critique": "Draft was missing refund order reference...", // Only if self-corrected
      "evaluationReport": {
        "overallScore": 0.91,
        "confidence": "High",
        "justification": "The response is fully grounded and addresses all action items.",
        "metrics": {
          "semanticSimilarity": { "score": 0.89, "reason": "..." },
          "bleu": { "score": 0.82, "reason": "..." }
        },
        "ruleEngine": {
          "passed": true,
          "violations": []
        }
      },
      "retrievedContext": [],
      "latencyMs": 1420
    }
    ```

---

## 2. POST `/api/evaluate`

Evaluates a pre-generated response draft against reference replies.

*   **Request Body:**
    ```json
    {
      "incomingEmail": "Can we reschedule tomorrow's sync?",
      "referenceReply": "Sure, let's move it to 2 PM EST tomorrow.",
      "generatedReply": "Hi, let's meet at 2 PM EST tomorrow instead."
    }
    ```
*   **Response Payload (200 OK):** Returns the `EvaluationReport` JSON block containing lexical scores, local BERTScore alignments, and rule validations.

---

## 3. POST `/api/improve`

Manually triggers the critique-based self-correction loop on a generated draft.

*   **Request Body:**
    ```json
    {
      "incomingEmail": "...",
      "referenceReply": "...",
      "originalResponse": "...",
      "evalReport": {} // Previous EvaluationReport object
    }
    ```

---

## 4. GET `/api/dataset`

Returns a paginated list of seed emails and reference replies.

*   **Query Parameters:**
    *   `page`: Page number (default `1`).
    *   `limit`: Page size (default `10`).
    *   `category`: Optional category string.
    *   `search`: Optional text query matching subject or body.

---

## 5. GET `/api/analytics`

Returns aggregated database statistics for dashboard charts.

*   **Response Payload (200 OK):**
    ```json
    {
      "summary": {
        "totalEvaluations": 45,
        "averageScore": 0.89,
        "averageLatencyMs": 1280,
        "averageLengthChars": 240,
        "tokenUsage": { "total": 12400, "prompt": 8900, "completion": 3500 }
      },
      "metricBreakdown": {},
      "categoryPerformance": [],
      "confidenceDistribution": { "High": 30, "Medium": 12, "Low": 3 },
      "ruleEngineFailures": []
    }
    ```

# Testing Guide

This project implements a test suite using **Vitest** to guarantee the accuracy and reliability of all evaluation algorithms, rule engine validations, and API router schemas.

---

## 1. Test Architecture

*   **Unit Tests (`tests/evaluator.test.ts`):** Evaluates mathematical accuracy of NLP lexical metrics:
    *   **BLEU-4:** Verifies exact matches evaluate to 1.0, complete mismatches to 0.0, and computes brevity penalties for partial matches.
    *   **ROUGE-L:** Verifies dynamic programming LCS matches over partial phrases.
    *   **METEOR:** Validates exact and stem alignments (e.g. mapping "tests" to "testing").
*   **Integration Tests (`tests/rules.test.ts`):** Audits deterministic rule engine checks:
    *   Verifies correct extraction of proper nouns and dates.
    *   Asserts failures when numerical fields mismatch between context and generated text.
    *   Asserts warnings when responses refer to attachments not present in source text.
    *   Asserts coverage failure when critical question marks are ignored.
*   **API Tests (`tests/api.test.ts`):** Mocks database pool queries and local transformers.js weight downloads to verify API endpoint responses:
    *   **GET `/api/health`:** Asserts database connection and configuration states.
    *   **POST `/api/evaluate`:** Verifies Zod validation handles missing parameters with `400 Bad Request` and runs scoring successfully on correct inputs.

---

## 2. Running the Test Suites

To execute all tests and print the coverage reports:

```bash
npm run test
```

---

## 3. Mocking & Performance Optimization

To prevent slow tests and high cost, the local embedding weights (`all-MiniLM-L6-v2`) and database queries are fully mocked inside `tests/api.test.ts`. This reduces typical test run durations from over 5 seconds (model download overhead) to under 1 second.

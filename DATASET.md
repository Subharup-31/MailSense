# Email Dataset & Seeding Specifications

This document outlines the pipeline for downloading, cleaning, parsing, and seeding email datasets.

---

## 1. Dataset Source

We use a pre-cleaned, corporate-focused subset of the **Enron Email Corpus** distributed by researchers at Connor Jerzak's repository.
*   **Host URL:** `https://huggingface.co/datasets/cjerzak/TextQuantificationDatasets`
*   **Format:** Compressed CSV (`enron.csv` ~10MB) containing 1,426 rows.
*   **Columns:** `"CATEGORY"`, `"RAWTEXT"`.

---

## 2. Cleaner & Normalization Pipelines

Before writing to the SQL database, each raw email undergoes a cleaning pipeline to strip network headers and metadata:

### MIME Header Parsing
Enron emails contain full MIME headers. The parser extracts the subject line via regex matching `^Subject:\s*(.*)$` and isolates the message body by splitting text after the final header field (`X-FileName:`).

### HTML Sanitization
Strips script blocks, style definitions, and raw HTML tags using clean regex replacements:
```typescript
text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
```

### Signature Stripping
Strips standard signature separators, mobile signatures ("Sent from my iPhone"), and closing salutations ("Best regards,", "Thanks,") followed by contact blocks.

### Deduplication
Calculates lowercase alphanumeric hashes of email bodies to identify and drop duplicate threads.

---

## 3. Categories & AI Annotation

Emails are mapped across **20 standard business communication categories**:
1. Customer Support
2. Scheduling
3. Recruitment
4. HR
5. Finance
6. Internal Communication
7. Technical Support
8. Sales
9. Marketing
10. Legal
11. Vendors
12. Management
13. Meetings
14. Project Updates
15. Follow Ups
16. Invoices
17. Refunds
18. Complaints
19. Job Applications
20. Announcements

Since Enron sent emails do not have incoming replies, the seeding script calls OpenRouter to generate:
*   A gold-standard professional reference reply.
*   The exact user intent.
*   Extracted entities (JSON list: type and value).
*   Follow-up Action Items list.
*   Difficulty level classification (Easy, Medium, Hard).
*   Tone mapping.
*   Index keywords.

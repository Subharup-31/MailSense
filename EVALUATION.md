# Evaluation Framework Specifications

The primary value of this platform is the multi-metric hybrid evaluation framework. Rather than relying on a single scorecard, it evaluates responses across three distinct layers.

---

## 1. Mathematical Formulations

### BLEU-4 (Bilingual Evaluation Understudy)
Measures N-gram precision (for $N=1,2,3,4$) between the generated reply and the gold reference, adjusted by a brevity penalty (BP) to penalize overly short replies:
$$\text{BLEU} = \text{BP} \cdot \exp\left(\sum_{n=1}^{4} w_n \log p_n\right)$$
*   **Brevity Penalty:** $\text{BP} = 1$ if $c > r$, else $e^{1 - r/c}$ (where $c$ is candidate word count, $r$ is reference word count).
*   **Weight ($w_n$):** Equal weighting ($0.25$) for each N-gram precision $p_n$.

### ROUGE-L (Longest Common Subsequence)
Measures the longest common subsequence of words between reference and generated reply, preserving word order without requiring consecutive matches:
$$\text{ROUGE-L} = \frac{2 \cdot P \cdot R}{P + R}$$
*   **Precision (P):** $\text{LCS}(\text{ref}, \text{cand}) / \text{cand\_length}$
*   **Recall (R):** $\text{LCS}(\text{ref}, \text{cand}) / \text{ref\_length}$

### METEOR (Metric for Evaluation of Translation with Explicit ORdering)
Matches tokens on exact words followed by word stems (using Porter-like suffix rules). It calculates the harmonic mean of precision and recall, applying a fragmentation penalty for broken word ordering:
*   **Harmonic Mean:** $F_{mean} = \frac{10 \cdot P \cdot R}{R + 9P}$
*   **Fragmentation Penalty:** $Pen = 0.5 \cdot (Ch / M)^3$ (where $Ch$ is matched chunks, $M$ is total matched words).
*   **Final Score:** $F_{mean} \cdot (1 - Pen)$

### BERTScore (Token Embedding Alignment)
Leverages a local HuggingFace SentenceTransformer model (`all-MiniLM-L6-v2`) to produce token-level embeddings. It calculates a cosine similarity matrix, performing maximum-similarity alignment to evaluate semantic overlap:
*   **Precision:** Average over candidate tokens of the maximum cosine similarity with any reference token.
*   **Recall:** Average over reference tokens of the maximum similarity with any candidate token.

---

## 2. Deterministic Rule Engine

Runs strict validations on the response string to capture hallucinations and factual errors:
*   **Dates Audit:** Verifies that no dates appear in the response unless they are explicitly present in the email thread or context.
*   **Proper Nouns Check:** Verifies names and entities match the source (prevents misaddressed replies).
*   **Numbers & Currency Check:** Ensures monetary amounts, order IDs, and percentages match.
*   **Attachment Check:** Flags responses promising attachments when no file context is mentioned.
*   **Question Coverage:** Parses question marks from incoming threads and checks if responses cover keywords associated with each query.

---

## 3. LLM Judge Specifications

Queries an independent LLM Judge instance for qualitative scoring:
*   **Intent Alignment:** Checks if the reply addresses the core intent.
*   **Completeness:** Verifies if all queries are answered.
*   **Grounding:** Confirms all statements are supported by context.
*   **Hallucination Rate:** Flags unsupported claims.
*   **Professionalism & Safety:** Audits tone and sensitive leak risks.
*   **Action Accuracy:** Verifies links and next steps.

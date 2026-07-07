# Tasks - Email Generation Architecture Upgrade

- [x] Refactor the seeding script to define 50+ high-quality, answer-oriented corporate Q&A pairs (Phase 4).
- [x] Run the seeder to overwrite the old mock database table (Phase 4 & Phase 7).
- [x] Refactor the default system prompt and user prompt assembly in `lib/openrouter.ts` (Phase 5 & Phase 6).
- [x] Implement similarity threshold filtering and graceful fallback in `lib/pinecone.ts` (Phase 7).
- [x] Implement deterministic failure rules for evaluator in `lib/evaluator.ts` (Phase 8).
- [ ] Create regression test script `scripts/run-regression-tests.ts` with 50 test cases (Phase 9).
- [ ] Execute the regression test suite and compile results (Phase 9).
- [ ] Verify the original failing email produces a correct response with score > 90/100 (Phase 11).
- [ ] Generate final documentation:
  - `ROOT_CAUSE_ANALYSIS.md`
  - `FIX_IMPLEMENTATION.md`
  - `PROMPT_IMPROVEMENTS.md`
  - `REGRESSION_RESULTS.md`

/**
 * Deterministic Rule Engine for validating generated email responses.
 */

export interface RuleViolation {
  rule: string;
  passed: boolean;
  severity: 'critical' | 'warning';
  reason: string;
}

export interface RuleEngineResult {
  passed: boolean;
  violations: RuleViolation[];
  score: number; // Percentage of rules passed
}

/**
 * Extracts all numbers (currency, float, integer) from a string.
 */
function extractNumbers(text: string): string[] {
  const numberPattern = /\b(?:\$?\d+(?:,\d{3})*(?:\.\d+)?%?)\b/g;
  return text.match(numberPattern) || [];
}

/**
 * Extracts words starting with capital letters (potential names/entities)
 * excluding standard English sentence starters.
 */
function extractProperNouns(text: string): string[] {
  // Simple regex for capital words
  const words = text.match(/\b[A-Z][a-z]+\b/g) || [];
  // Filter out common words that might start sentences
  const commonStopWords = new Set([
    'The', 'Hi', 'Hello', 'Dear', 'I', 'We', 'They', 'He', 'She', 'It', 
    'You', 'Thanks', 'Regards', 'Best', 'Sincerely', 'Please', 'If', 'Then',
    'Our', 'Your', 'Their', 'My', 'This', 'That', 'These', 'Those', 'On', 
    'At', 'In', 'By', 'For', 'With', 'From', 'About', 'As', 'But', 'Or', 'And',
    'See', 'Let', 'Go', 'How', 'Can', 'Could', 'Is', 'Are', 'Will', 'Would', 
    'Sure', 'Ok', 'Okay', 'So', 'Not', 'No', 'Yes'
  ]);
  return Array.from(new Set(words.filter(w => !commonStopWords.has(w))));
}

/**
 * Extracts question sentences from a text.
 */
function extractQuestions(text: string): string[] {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  return sentences.filter(s => {
    // Check if the original sentence in text ended with a question mark
    const idx = text.indexOf(s);
    if (idx !== -1) {
      const charAfter = text.charAt(idx + s.length);
      return charAfter === '?' || s.toLowerCase().startsWith('who') || s.toLowerCase().startsWith('what') || s.toLowerCase().startsWith('why') || s.toLowerCase().startsWith('how') || s.toLowerCase().startsWith('when') || s.toLowerCase().startsWith('can you') || s.toLowerCase().startsWith('could you');
    }
    return false;
  });
}

/**
 * Runs the deterministic rule engine.
 */
export function runRuleEngine(
  incomingEmail: string,
  referenceReply: string,
  generatedReply: string
): RuleEngineResult {
  const violations: RuleViolation[] = [];

  const incomingClean = incomingEmail.toLowerCase();
  const refClean = referenceReply.toLowerCase();
  const genClean = generatedReply.toLowerCase();

  // 1. Date Validation
  // Extract date-like formats (e.g. Month DD, DD/MM/YYYY, tomorrow, Friday)
  const datePattern = /\b(?:\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}\b/gi;
  const sourceDates = [
    ...(incomingEmail.match(datePattern) || []),
    ...(referenceReply.match(datePattern) || [])
  ].map(d => d.toLowerCase());
  
  const genDates = (generatedReply.match(datePattern) || []).map(d => d.toLowerCase());
  
  // Verify that any dates mentioned in the generated reply exist in the source or reference
  const invalidDates = genDates.filter(d => !sourceDates.includes(d));
  violations.push({
    rule: 'Correct Dates',
    passed: invalidDates.length === 0,
    severity: 'critical',
    reason: invalidDates.length === 0 
      ? 'All dates mentioned in the reply match the source context.'
      : `The generated reply introduced unexpected dates: ${invalidDates.join(', ')}.`
  });

  // 2. Name / Entity Validation
  const sourceNouns = [
    ...extractProperNouns(incomingEmail),
    ...extractProperNouns(referenceReply)
  ].map(n => n.toLowerCase());
  const genNouns = extractProperNouns(generatedReply).map(n => n.toLowerCase());
  
  const unknownNouns = genNouns.filter(n => !sourceNouns.includes(n));
  violations.push({
    rule: 'Correct Names & Entities',
    passed: unknownNouns.length === 0,
    severity: 'warning',
    reason: unknownNouns.length === 0
      ? 'All proper nouns in the reply match the context.'
      : `The reply introduced undocumented entities or names: ${unknownNouns.join(', ')}.`
  });

  // 3. Numbers & Currency Check
  const sourceNumbers = [
    ...extractNumbers(incomingEmail),
    ...extractNumbers(referenceReply)
  ];
  const genNumbers = extractNumbers(generatedReply);
  const mismatchedNumbers = genNumbers.filter(n => !sourceNumbers.includes(n));
  
  violations.push({
    rule: 'Mismatched Numbers',
    passed: mismatchedNumbers.length === 0,
    severity: 'critical',
    reason: mismatchedNumbers.length === 0
      ? 'All numbers and currency values are consistent with the context.'
      : `The generated reply introduced new or conflicting figures: ${mismatchedNumbers.join(', ')}.`
  });

  // 4. Attachment References Check
  const attachmentKeywords = ['attach', 'enclos', 'resume', 'pdf', 'docx', 'file'];
  const sourceMentionsAttachment = attachmentKeywords.some(kw => incomingClean.includes(kw) || refClean.includes(kw));
  const genMentionsAttachment = attachmentKeywords.some(kw => genClean.includes(kw));

  violations.push({
    rule: 'Attachment Consistency',
    passed: !(genMentionsAttachment && !sourceMentionsAttachment),
    severity: 'warning',
    reason: !(genMentionsAttachment && !sourceMentionsAttachment)
      ? 'Attachment references are consistent with context.'
      : 'The generated response mentions attachments, but none were present in the source or reference emails.'
  });

  // 5. Question Coverage Check
  const questions = extractQuestions(incomingEmail);
  let unansweredQuestions = 0;
  if (questions.length > 0) {
    questions.forEach(q => {
      // Very simple semantic overlap check for answering the question
      const keywords = q.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(' ')
        .filter(w => w.length > 4); // look at key words
      
      const hasKeywordsInGen = keywords.some(kw => genClean.includes(kw));
      if (!hasKeywordsInGen && keywords.length > 0) {
        unansweredQuestions++;
      }
    });
  }

  violations.push({
    rule: 'Question Coverage',
    passed: unansweredQuestions === 0,
    severity: 'critical',
    reason: unansweredQuestions === 0
      ? `All ${questions.length} questions in the email appear to be addressed.`
      : `The reply failed to address ${unansweredQuestions} questions from the incoming email.`
  });

  // 6. Missing Action Items
  // If reference mentions links or actions like "call", "schedule", "calendly", check if gen mentions them
  const actionKeywords = ['calendly', 'link', 'call', 'schedule', 'zoom', 'meeting', 'phone', 'refund', 'invoice'];
  const sourceActions = actionKeywords.filter(kw => refClean.includes(kw));
  const missingActions = sourceActions.filter(kw => !genClean.includes(kw));

  violations.push({
    rule: 'Action Item Accuracy',
    passed: missingActions.length === 0,
    severity: 'warning',
    reason: missingActions.length === 0
      ? 'All action items from the reference reply are addressed.'
      : `The generated reply missed action items: ${missingActions.join(', ')}.`
  });

  // 7. No Redundant / Fabricated Questions
  const refHasQuestion = referenceReply.includes('?');
  const genHasQuestion = generatedReply.includes('?');
  const isInventingQuestions = genHasQuestion && !refHasQuestion;

  violations.push({
    rule: 'No Redundant Questions',
    passed: !isInventingQuestions,
    severity: 'critical',
    reason: !isInventingQuestions
      ? 'The generated reply does not invent unrequested clarification questions.'
      : 'The generated reply asks questions back to the customer, but the reference reply had no questions.'
  });

  // 8. No Verbatim Repetition
  const incomingSentences = incomingEmail.split(/[.!\n]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
  const genSentences = generatedReply.split(/[.!\n]+/).map(s => s.trim().toLowerCase()).filter(s => s.length > 20);
  let repeatsIncoming = false;
  let repeatedSentence = '';

  for (const genSent of genSentences) {
    if (incomingSentences.some(incSent => incSent.includes(genSent) || genSent.includes(incSent))) {
      repeatsIncoming = true;
      repeatedSentence = genSent;
      break;
    }
  }

  violations.push({
    rule: 'No Verbatim Repetition',
    passed: !repeatsIncoming,
    severity: 'warning',
    reason: !repeatsIncoming
      ? 'The reply does not repeat large sentences from the incoming email.'
      : `The reply repeated the incoming email sentence: "${repeatedSentence}".`
  });

  // Calculate score
  const passedRules = violations.filter(v => v.passed).length;
  const score = passedRules / violations.length;

  return {
    passed: violations.every(v => v.severity === 'critical' ? v.passed : true),
    violations,
    score
  };
}

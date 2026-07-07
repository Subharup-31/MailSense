import { describe, it, expect } from 'vitest';
import { runRuleEngine } from '../lib/rules';

describe('Deterministic Rule Engine Tests', () => {
  
  it('should pass if all dates, names, numbers, and attachments are consistent', () => {
    const incoming = 'Can we meet on September 1st? - Sarah';
    const reference = 'Sure, let us schedule for September 1st. Thanks, Team.';
    const generated = 'Hi Sarah, let\'s schedule to meet on September 1st. See you then!';
    
    const result = runRuleEngine(incoming, reference, generated);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(1.0); // 6 out of 6 rules passed
  });

  it('should detect incorrect/mismatched dates', () => {
    const incoming = 'Rescheduled to Friday, July 10';
    const reference = 'The meeting is moved to July 10';
    const generated = 'Your meeting is now set for July 11'; // Hallucinated date
    
    const result = runRuleEngine(incoming, reference, generated);
    const dateViolation = result.violations.find(v => v.rule === 'Correct Dates');
    
    expect(dateViolation?.passed).toBe(false);
    expect(dateViolation?.severity).toBe('critical');
  });

  it('should detect mismatched numbers', () => {
    const incoming = 'Invoice #552 is for $120';
    const reference = 'Your invoice #552 totals $120';
    const generated = 'Thank you for the payment of $150 on invoice #552'; // Mismatched price
    
    const result = runRuleEngine(incoming, reference, generated);
    const numViolation = result.violations.find(v => v.rule === 'Mismatched Numbers');
    
    expect(numViolation?.passed).toBe(false);
    expect(numViolation?.severity).toBe('critical');
  });

  it('should flag attachment references when none are in context', () => {
    const incoming = 'How do I access the portal?';
    const reference = 'Use your email credentials on portal.com';
    const generated = 'I have attached the portal user guide. Best regards.'; // Mentions attachment, not in context
    
    const result = runRuleEngine(incoming, reference, generated);
    const attachViolation = result.violations.find(v => v.rule === 'Attachment Consistency');
    
    expect(attachViolation?.passed).toBe(false);
    expect(attachViolation?.severity).toBe('warning');
  });

  it('should fail question coverage if key queries are ignored', () => {
    const incoming = 'What is the pricing for Enterprise? How many seats are included?';
    const reference = 'Enterprise pricing is $25/user/month. Standard seats limit is 250.';
    const generated = 'Hi, thanks for reaching out. Enterprise plans are great. Let us know if you want a demo!'; // Ignored pricing/seats questions
    
    const result = runRuleEngine(incoming, reference, generated);
    const qViolation = result.violations.find(v => v.rule === 'Question Coverage');
    
    expect(qViolation?.passed).toBe(false);
  });
});

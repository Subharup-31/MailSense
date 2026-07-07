import { retrieveSimilarEmails } from '../lib/pinecone';
import { callLLM, compilePrompt, getActivePromptTemplate } from '../lib/openrouter';
import { evaluateResponse } from '../lib/evaluator';
import * as fs from 'fs';
import * as path from 'path';

interface TestCase {
  category: string;
  subject: string;
  body: string;
  reference: string;
}

const TEST_CASES: TestCase[] = [
  // Scheduling (5)
  {
    category: 'Scheduling',
    subject: 'Reschedule client onboarding',
    body: 'Hi, I have a conflict tomorrow at 2:00 PM and need to reschedule our client onboarding call. Can we move it to Thursday morning at 10:00 AM EST? Let me know if that works.',
    reference: 'Hi, no problem at all. We have rescheduled the client onboarding call to Thursday morning at 10:00 AM EST. The calendar invitation has been updated. Talk to you then.'
  },
  {
    category: 'Scheduling',
    subject: 'Sync schedule adjustment',
    body: 'Hello team, due to a travel delay I cannot join the marketing sync today. Can we reschedule to Friday at 11:30 AM EST? Thanks.',
    reference: 'Hello, we have moved the marketing sync to Friday at 11:30 AM EST. A revised calendar invite has been sent. Have a safe trip!'
  },
  {
    category: 'Scheduling',
    subject: 'Request for product showcase',
    body: 'Hi, we would like to schedule a product showcase session for our leadership team next week. Are you available on Monday or Wednesday afternoon?',
    reference: 'Hi, we would be delighted to host a product showcase session. We have scheduled a 45-minute showcase for next Monday at 2:00 PM EST. The invite is in your inbox.'
  },
  {
    category: 'Scheduling',
    subject: 'Confirming strategy session time',
    body: 'Hi Support, could you please confirm the exact time and Zoom link for our upcoming strategy session on July 15th?',
    reference: 'Hi, the strategy session is confirmed for July 15th at 1:00 PM EST. The Zoom link is https://zoom.us/j/99882211. Looking forward to speaking with you.'
  },
  {
    category: 'Scheduling',
    subject: 'Candidate interview adjustment',
    body: 'Hi recruiter, I need to reschedule my technical interview tomorrow. I have a dentist appointment. Can we move it to next Monday at 9:00 AM?',
    reference: 'Hi, thank you for letting us know. We have rescheduled your technical interview to next Monday at 9:00 AM EST. An updated invitation has been sent.'
  },

  // HR (5)
  {
    category: 'HR',
    subject: 'Vision insurance details query',
    body: 'Hello HR, I need to check if annual eye examinations and prescription lenses are covered under our vision insurance. What is the allowance cap?',
    reference: 'Hello, under our vision insurance plan, annual eye exams are covered 100% with no co-pay. Prescription lenses have a hardware allowance cap of $200 per year.'
  },
  {
    category: 'HR',
    subject: 'Request for PTO policy manual',
    body: 'Hi HR, can you send over the current PTO Policy PDF? I want to verify the maximum rollover hours allowed into next year.',
    reference: 'Hi, we have attached the PTO Policy PDF to this email. You can roll over a maximum of 40 hours of accrued PTO into the next calendar year.'
  },
  {
    category: 'HR',
    subject: 'Workday registration error',
    body: 'Hi support team, I am a new hire trying to log in to Workday to fill out tax paperwork, but my onboarding link returns an invalid token error.',
    reference: 'Hi, we apologize for the error. We have reset your onboarding token in Workday and sent a new activation link to your email. Please try again.'
  },
  {
    category: 'HR',
    subject: '401k employer match guidelines',
    body: 'Dear HR, could you please clarify what the company\'s matching percentage is for 401k contributions, and when we become fully vested?',
    reference: 'Dear Employee, the company matches 100% of your contributions up to 4% of your base salary. You are 100% vested in all employer matching contributions immediately.'
  },
  {
    category: 'HR',
    subject: 'Sick leave duration limit',
    body: 'Hello, I have been diagnosed with flu. Does the company require a doctor\'s note for sick leave if I am out for three consecutive days?',
    reference: 'Hello, yes, our policy requires a doctor\'s note for sick leave absences exceeding two consecutive business days. Please upload the note to Workday once you return.'
  },

  // Support (5)
  {
    category: 'Customer Support',
    subject: 'API credentials expired',
    body: 'Hi support, our server webhook integration stopped working. It looks like our client credentials expired. Can you regenerate them?',
    reference: 'Hi, we have regenerated your API client credentials and updated the keys in your account dashboard under Settings > API Keys. Please download the credentials.'
  },
  {
    category: 'Customer Support',
    subject: 'Unsubscribing from mailing list',
    body: 'Please unsubscribe my email billing@client.com from all marketing notifications and newsletters immediately.',
    reference: 'Hello, we have successfully unsubscribed billing@client.com from all marketing mailings and newsletters. You will only receive transactional invoices.'
  },
  {
    category: 'Customer Support',
    subject: 'Password reset link not arriving',
    body: 'Hi, I clicked password reset on the login page multiple times, but I am not receiving any recovery emails. Can you manually trigger it?',
    reference: 'Hi, we have verified your registration and manually sent a password reset link to your email. Please check your spam folder if it doesn\'t arrive.'
  },
  {
    category: 'Customer Support',
    subject: 'Exporting transaction ledger',
    body: 'Hello support, is it possible to download our transaction history report for the entire year? I need it for tax audit purposes.',
    reference: 'Hello, yes, you can download your annual transaction history report by logging into the dashboard and navigating to Billing > Invoices > Export All as CSV.'
  },
  {
    category: 'Customer Support',
    subject: 'Cannot upload files to team workspace',
    body: 'Hi support, we are getting a quota error when uploading PDF assets to our shared workspace. We only used 5GB out of our 10GB limit.',
    reference: 'Hi, we found a disk quota sync error on our storage cluster. We have resolved the sync issue, and your team can now upload up to your full 10GB limit.'
  },

  // Finance (5)
  {
    category: 'Finance',
    subject: 'Q3 budget code allocation',
    body: 'Hi Finance, we are planning a hiring campaign for the engineering team in Q3. Can you please provide the approved budget code?',
    reference: 'Hi Recruitment, the approved Q3 engineering recruitment campaign budget is $15,000, and the finance ledger code is ENG-REC-2026-Q3. Please reference it in all expenses.'
  },
  {
    category: 'Finance',
    subject: 'Request for ACH payment details',
    body: 'Hi accounts payable, our company wants to settle our monthly invoice via ACH. Could you send over your bank name, routing number, and account number?',
    reference: 'Hello, our ACH bank details are: Bank: Chase National, Account: 987654321, Routing (ACH): 021000021. Please include the invoice number in the payment description.'
  },
  {
    category: 'Finance',
    subject: 'Invoice amount mismatch review',
    body: 'Dear Finance, invoice INV-990 shows a total of $5,400, but our purchase order was cleared for $4,500 due to the Q2 discount. Please review.',
    reference: 'Dear Client, we apologize for the error. Invoice INV-990 has been corrected to $4,500 to reflect the 10% Q2 discount. The revised invoice is attached.'
  },
  {
    category: 'Finance',
    subject: 'Expense report audit status',
    body: 'Hello Finance, I submitted my travel report EXP-442 last week but have not received reimbursement. Can you check the status?',
    reference: 'Hello, expense report EXP-442 has been audited and approved. The reimbursement will be processed in this Friday\'s payroll cycle via direct deposit.'
  },
  {
    category: 'Finance',
    subject: 'Wire transfer payment receipt',
    body: 'Hi finance, we processed the bank wire transfer of $8,500 for invoice INV-112 today. Attached is the wire transfer confirmation receipt.',
    reference: 'Hi there, thank you for providing the receipt. We have received the wire transfer of $8,500, marked invoice INV-112 as fully paid, and updated your status.'
  },

  // Sales (5)
  {
    category: 'Sales',
    subject: 'Enterprise tier contract pricing',
    body: 'Hi Sales, we are a group of 80 users looking to sign up. Can you send over the pricing list for the enterprise tier and details on volume discounts?',
    reference: 'Hello, for groups above 50 seats, we offer a volume discount of $12/user/month for the Enterprise Tier. We have attached the contract proposal for 80 seats.'
  },
  {
    category: 'Sales',
    subject: 'NDA signature request',
    body: 'Hi team, please find attached our mutual NDA. Let us know when it has been executed so we can proceed with technical evaluations.',
    reference: 'Hi, we have reviewed and signed the mutual NDA. The executed PDF copy is attached. We are ready to proceed with the technical evaluations.'
  },
  {
    category: 'Sales',
    subject: 'Prorated billing details request',
    body: 'Hello, we upgraded our subscription from Standard to Premium mid-cycle. Can you explain the prorated charge of $45 on our invoice?',
    reference: 'Hello, the prorated charge of $45 represents the subscription difference for the remaining 15 days of your billing cycle. Regular billing begins next month.'
  },
  {
    category: 'Sales',
    subject: 'Sales partner margins query',
    body: 'Hi Sales team, we want to know what the standard commission margin is for referral partners in the European region.',
    reference: 'Hello, our European Referral Partner program offers a 20% recurring commission on all contract values referred and closed by your agency.'
  },
  {
    category: 'Sales',
    subject: 'Pilot extension request',
    body: 'Hi, our team needs an extra two weeks to finish evaluating the sandbox environment. Can you extend our trial pilot until August 30th?',
    reference: 'Hi, no problem at all. We have extended your sandbox trial pilot environment access until August 30th. Let us know if you need technical assistance.'
  },

  // Recruitment (5)
  {
    category: 'Recruitment',
    subject: 'DevOps role interview format',
    body: 'Hello recruiting, I have an upcoming technical interview next week. Could you share what the assessment format will be?',
    reference: 'Hello Candidate, the interview is a 60-minute live session consisting of a system design discussion and a coding challenge. No preparation is required.'
  },
  {
    category: 'Recruitment',
    subject: 'Hiring reference list submission',
    body: 'Hi recruiting team, here are the email addresses of my two professional references as requested: referee1@org.com and referee2@org.com.',
    reference: 'Hi, thank you for providing the reference contacts. We have received them and will initiate reference checks this afternoon. Have a great day.'
  },
  {
    category: 'Recruitment',
    subject: 'Application feedback - Senior Product Manager',
    body: 'Hello, I haven\'t heard back regarding my application for Senior PM position. Can you update me on the hiring status?',
    reference: 'Hello, thank you for checking in. The Senior PM applications are currently being reviewed. We expect to send interview invitations by next Wednesday.'
  },
  {
    category: 'Recruitment',
    subject: 'Salary range details - HR Specialist vacancy',
    body: 'Hi, could you please tell me the salary band and compensation breakdown for the open HR Specialist role?',
    reference: 'Hello, the base salary range for the HR Specialist role is $85,000 - $105,000 per year, plus a 5% bonus target and standard health benefits.'
  },
  {
    category: 'Recruitment',
    subject: 'Offer letter signed confirmation',
    body: 'Dear Team, I am happy to accept the job offer! I have uploaded the signed document and look forward to starting on September 1st.',
    reference: 'Dear Candidate, welcome to the team! We have received your signed offer letter. Your start date is confirmed for September 1st. Onboarding details follow.'
  },

  // Technical Support (5)
  {
    category: 'Technical Support',
    subject: 'Website ssl connection warning',
    body: 'Hi support, our domain secure-checkout.com shows an expired certificate security error. Can you renew our SSL today?',
    reference: 'Hi, we have successfully renewed the SSL certificate for secure-checkout.com. The site is now secure. Please refresh your browser window.'
  },
  {
    category: 'Technical Support',
    subject: 'Slow search indexes query response',
    body: 'Hello, our search requests are taking over 5 seconds to load database results. Can you check if we need index maintenance?',
    reference: 'Hello, we investigated and added a database index on the content column in our articles table. Search query speeds have returned to under 20ms.'
  },
  {
    category: 'Technical Support',
    subject: 'Webhooks returning 500 error code',
    body: 'Hi, our webhook logs show that deliveries to our webhook listener are failing with 500 internal errors. Please review server dispatch logs.',
    reference: 'Hi, we audited our webhook dispatches and confirmed that our system was retrying outdated payloads. We have cleared the queue, and logs are now green.'
  },
  {
    category: 'Technical Support',
    subject: 'Adding custom scripts to panel',
    body: 'Hi support, we need to paste our marketing tracking pixel header script. Where is the header tag setting page in the dashboard?',
    reference: 'Hi, you can add header tracking scripts by going to Settings > Integration > Custom Scripts and pasting your tag inside the script editor panel.'
  },
  {
    category: 'Technical Support',
    subject: 'Lockout on account two factor',
    body: 'Help support, I lost my security key device and cannot complete the 2FA login verification step. Can you unlock my user dashboard?',
    reference: 'Hello, we have temporarily deactivated Two-Factor Authentication on your profile. Please login and setup a new authenticator token immediately.'
  },

  // Legal (5)
  {
    category: 'Legal',
    subject: 'IP protection and transfer clause',
    body: 'Hi, we need to ensure that our service agreement guarantees full ownership of all custom software code developed under the contract. Can you confirm?',
    reference: 'Hi there, we confirm that under Section 14.1 of the software contract agreement, all IP rights for deliverables are assigned to you upon payment.'
  },
  {
    category: 'Legal',
    subject: 'DPA copy for compliance files',
    body: 'Hi team, could you send over a pre-signed Data Processing Addendum PDF? We need it to satisfy our regulatory compliance audits.',
    reference: 'Hi, we have attached our pre-signed Data Processing Addendum (DPA) incorporating standard EU contractual clauses. Please return a signed copy.'
  },
  {
    category: 'Legal',
    subject: 'Timeline clarification and contract details',
    body: 'Thank you for sending over the agreement. Before we proceed, I need clarification on a few points. First, the payment schedule in Section 4 appears to conflict with what we discussed during last week\'s meeting. Second, could you confirm whether the maintenance services are included for the first year or billed separately? Finally, we are aiming to begin implementation on August 15th. Please let us know if that timeline is still feasible.',
    reference: 'Dear Client, thank you for reaching out. We are happy to clarify these points: First, we will adjust Section 4 to reflect our meeting discussion, ensuring the payment schedule is aligned. Second, we confirm that maintenance services are included at no additional cost for the first year. Finally, the August 15th implementation timeline is fully feasible, and we will update the agreement to reflect this start date.'
  },
  {
    category: 'Legal',
    subject: 'SLA service downtime liability cap',
    body: 'Hello, our risk team requests that the SLA liability cap is limited to six months of subscription fees. Does your legal agreement support this?',
    reference: 'Hello, yes, our SLA agreement limitation of liability is capped at the total amount paid by you in the 6 months prior to the incident.'
  },
  {
    category: 'Legal',
    subject: 'NDA term limits check',
    body: 'Hello Legal, what is the confidentiality term duration for the non-disclosure agreement we signed with you last June?',
    reference: 'Hello, the NDA signed last June contains a confidentiality duration clause of three (3) years from the initial date of execution.'
  },

  // Complaints (5)
  {
    category: 'Complaints',
    subject: '4 hour database downtime incident',
    body: 'Hi support, we experienced a database outage of 4 hours this morning, blocking our order checkouts. We expect an SLA credit payout.',
    reference: 'Hello, we sincerely apologize for the database outage. We have approved and applied a 10% SLA credit to your billing ledger for this month.'
  },
  {
    category: 'Complaints',
    subject: 'Support team ignored my issue',
    body: 'Hi manager, I opened a critical ticket on Monday and it was ignored for 48 hours. This is unacceptable performance from your support team.',
    reference: 'Hello, we apologize for the lack of response. Your ticket was accidentally misrouted. We have escalated it to our engineering manager for resolution.'
  },
  {
    category: 'Complaints',
    subject: 'Charged again post account termination',
    body: 'Hi, I terminated my subscription last month, but Stripe charged my credit card $39 today. Refund this now and delete my profile.',
    reference: 'Hi, we apologize for the mistake. We confirmed your cancellation request on June 20th and have processed a full $39 refund to your card.'
  },
  {
    category: 'Complaints',
    subject: 'Onboarding delay for production API keys',
    body: 'Hello, we submitted our compliance verification papers 5 days ago and still have no active production API keys. We need this resolved today.',
    reference: 'Hello, we apologize for the delay. We have manually verified your compliance documents and activated your production API keys immediately.'
  },
  {
    category: 'Complaints',
    subject: 'High endpoint latency during checkout',
    body: 'Hi support, we are experiencing response times over 3000ms during checkout today. This is causing order drops. Please fix the API load.',
    reference: 'Hi, we apologize for the checkout latency. We added a read-replica node to the payment database pool, restoring latency back under 120ms.'
  },

  // Invoices (5)
  {
    category: 'Invoices',
    subject: 'Missing transaction invoice receipt',
    body: 'Hello, my card was charged $150 yesterday, but I did not receive the transaction invoice invoice PDF in my email inbox.',
    reference: 'Hello, we have attached the transaction invoice PDF for the charge of $150 (INV-2026-06) to this email. Let us know if you need anything else.'
  },
  {
    category: 'Invoices',
    subject: 'Invoice reissued with new address',
    body: 'Hi Finance, please update our company address to 100 Main St, Chicago and reissue invoice #8890 immediately.',
    reference: 'Hello, we updated your billing profile address to 100 Main St, Chicago, regenerated invoice #8890, and attached the updated PDF copy here.'
  },
  {
    category: 'Invoices',
    subject: 'Void duplicate invoice payments',
    body: 'Hello support, we paid invoice #990 yesterday, but our credit card statement shows two identical charges of $200. Please refund one.',
    reference: 'Hello, we checked and verified a duplicate payment transaction. We have voided and refunded the duplicate charge of $200 back to your card.'
  },
  {
    category: 'Invoices',
    subject: 'Requesting vendor W-9 tax documentation',
    body: 'Dear Vendor, please send over a signed W9 form so we can register your company in our accounts payable portal.',
    reference: 'Dear Client, we have attached our signed 2026 W-9 form (W-9.pdf) to this email. Please forward it to your accounts payable department.'
  },
  {
    category: 'Invoices',
    subject: 'INV-440 payment terms extension',
    body: 'Hi billing support, can we get an extension of our invoice INV-440 payment terms from June 30th to July 15th?',
    reference: 'Hi, we have updated the payment terms for invoice INV-440, extending the due date to July 15th without late fees. The invoice is attached.'
  },

  // Refunds (5)
  {
    category: 'Refunds',
    subject: 'Refund request for duplicate license purchase',
    body: 'Hello, I accidentally bought two course licenses for my team instead of one. Can I get a refund of $60 for the second license?',
    reference: 'Hello, we have cancelled the duplicate license and processed a refund of $60. The credit should reflect on your card in 5-10 business days.'
  },
  {
    category: 'Refunds',
    subject: 'Damaged hardware return verify and refund',
    body: 'Hi support, we returned the damaged camera unit yesterday (tracking #1Z990). Please confirm return status and process our refund.',
    reference: 'Hi, we received your returned camera unit at our warehouse and have processed a full refund of $180 to your payment card. Have a nice day.'
  },
  {
    category: 'Refunds',
    subject: 'Unused software subscription refund request',
    body: 'Hello, I was charged $29 for subscription renewal yesterday, but our project was cancelled. We did not use the service. Can we get a refund?',
    reference: 'Hello, we checked your logs and verified zero usage since renewal. We have processed a full refund of $29. The credit should post shortly.'
  },
  {
    category: 'Refunds',
    subject: 'Delayed refund transaction status check',
    body: 'Dear Finance, you processed refund REF-8890 on June 1st, but it has not shown up on my card. Can you check with your bank?',
    reference: 'Dear Client, the refund was settled on June 1st. We have attached the transaction receipt containing the ARN code so your bank can track it.'
  },
  {
    category: 'Refunds',
    subject: 'Flight cancellation reimbursement inquiry',
    body: 'Hi support, is our cancelled flight booking (FLT-889) eligible for a cash refund, or only travel voucher credit?',
    reference: 'Hi there, according to the airline fare rules for flight FLT-889, your ticket is eligible for a full cash refund of $350, which we have processed.'
  }
];

async function runRegression() {
  console.log('--- STARTING 50-EMAIL PIPELINE REGRESSION TESTS ---');
  
  const results: Array<{
    category: string;
    subject: string;
    incoming: string;
    reference: string;
    reply: string;
    score: number;
    status: string;
    violations: string[];
  }> = [];

  const templateData = await getActivePromptTemplate();
  const startAll = Date.now();
  let passedCount = 0;

  for (let i = 0; i < TEST_CASES.length; i++) {
    const tc = TEST_CASES[i];
    console.log(`[${i + 1}/${TEST_CASES.length}] Processing "${tc.subject}" (${tc.category})...`);

    try {
      // 1. Retrieve context (similarity threshold filter is active in pinecone.ts)
      const retrieved = await retrieveSimilarEmails(
        `${tc.subject} ${tc.body}`,
        tc.category,
        3
      );

      const examplesText = retrieved.map((item, index) => {
        return `Example ${index + 1}:
Category: ${item.category}
Subject: ${item.subject}
Incoming Email: ${item.body}
Ideal Response: ${item.reply}
---`;
      }).join('\n\n');

      // 2. Compile prompt
      const compiledPromptText = compilePrompt(templateData.content, {
        subject: tc.subject,
        body: tc.body,
        tone: 'Professional',
        examples: examplesText || 'No reference examples available.'
      });

      // 3. Request LLM response
      const llmResult = await callLLM([
        { 
          role: 'system', 
          content: 'You are a professional customer support representative and company agent. Your goal is to draft decisive, helpful corporate replies that answer customer questions directly and accurately, following our strict business context and reference examples. Do not ask redundant questions, and do not repeat customer questions verbatim.' 
        },
        { role: 'user', content: compiledPromptText }
      ], {
        temperature: 0.1 // Keep output deterministic
      });

      // 4. Run Evaluation
      const evalReport = await evaluateResponse(
        tc.body,
        tc.reference,
        llmResult.text
      );

      const passed = evalReport.overallScore >= 0.80;
      if (passed) passedCount++;

      const violationsList = evalReport.ruleEngine.violations
        .filter(v => !v.passed)
        .map(v => `${v.rule} (${v.severity})`);

      results.push({
        category: tc.category,
        subject: tc.subject,
        incoming: tc.body,
        reference: tc.reference,
        reply: llmResult.text,
        score: evalReport.overallScore,
        status: passed ? 'PASS' : 'FAIL',
        violations: violationsList
      });

      console.log(`   Result: ${passed ? 'PASS' : 'FAIL'} | Score: ${evalReport.overallScore.toFixed(3)} | Violations: ${violationsList.join(', ') || 'None'}`);

      // Rate limit safety delay for Groq Free Tier TPM limits (12,000 TPM)
      await new Promise(resolve => setTimeout(resolve, 8000));

    } catch (err: any) {
      console.error(`   Error processing test case ${i + 1}:`, err.message || err);
      results.push({
        category: tc.category,
        subject: tc.subject,
        incoming: tc.body,
        reference: tc.reference,
        reply: 'ERROR: ' + (err.message || err),
        score: 0,
        status: 'FAIL',
        violations: ['Execution Error']
      });
    }
  }

  const durationMs = Date.now() - startAll;
  const passRate = (passedCount / TEST_CASES.length) * 100;
  console.log(`\n--- Regression Finished. Pass Rate: ${passRate.toFixed(1)}% (${passedCount}/${TEST_CASES.length}) in ${(durationMs/1000).toFixed(1)}s ---`);

  // Write results to REGRESSION_RESULTS.md in project root
  const mdPath = path.join(process.cwd(), 'REGRESSION_RESULTS.md');
  let mdContent = `# Regression Test Results - Email Response Pipeline

*   **Execution Date**: ${new Date().toISOString()}
*   **Total Test Cases**: ${TEST_CASES.length}
*   **Passes**: ${passedCount}
*   **Failures**: ${TEST_CASES.length - passedCount}
*   **Pass Rate**: ${passRate.toFixed(1)}%
*   **Total Duration**: ${(durationMs / 1000).toFixed(1)} seconds

## Detailed Results Table

| # | Category | Subject | Evaluation Score | Status | Violations / Comments |
|---|----------|---------|------------------|--------|-----------------------|
`;

  results.forEach((r, idx) => {
    mdContent += `| ${idx + 1} | ${r.category} | ${r.subject} | ${r.score.toFixed(3)} | **${r.status}** | ${r.violations.join(', ') || 'None'} |\n`;
  });

  fs.writeFileSync(mdPath, mdContent, 'utf-8');
  console.log(`Results successfully saved to: ${mdPath}`);
}

runRegression();

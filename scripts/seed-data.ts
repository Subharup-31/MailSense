export interface SeedEmail {
  category: string;
  subject: string;
  body: string;
  reply: string;
  intent: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tone: string;
  keywords: string[];
  action_items: string[];
  entities: { type: string; value: string }[];
}

export const SEED_EMAILS: SeedEmail[] = [
  // ==================== CATEGORY: Scheduling (5) ====================
  {
    category: 'Scheduling',
    subject: 'Request to reschedule Q3 QBR meeting',
    body: 'Hi team, I have a conflict on Thursday afternoon and need to reschedule our Q3 Quarterly Business Review. Can we move it to Friday, July 10th at 10:00 AM EST or 2:00 PM EST? Please let me know what works.',
    reply: 'Hi there, thank you for reaching out. We have rescheduled the Q3 QBR meeting to Friday, July 10th at 10:00 AM EST. A new calendar invitation has been sent to your inbox. Let us know if you need any further adjustments.',
    intent: 'Reschedule Q3 QBR meeting',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['reschedule', 'qbr', 'meeting', 'calendar'],
    action_items: ['Send new calendar invitation for July 10th at 10:00 AM EST'],
    entities: [{ type: 'Date', value: 'Friday, July 10th' }]
  },
  {
    category: 'Scheduling',
    subject: 'Availability for product demo session',
    body: 'Hello, I am interested in seeing a demo of your email analytics tool next week. I am free on Tuesday morning or Wednesday afternoon. Do you have 30 minutes available?',
    reply: 'Hello, thank you for your interest in our email analytics tool. We would love to host a demo session for you. We have scheduled a 30-minute demo for Tuesday next week at 10:00 AM EST. You should receive a calendar invite shortly.',
    intent: 'Schedule product demo session',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['demo', 'schedule', 'availability', 'analytics'],
    action_items: ['Send demo meeting invitation for Tuesday at 10:00 AM EST'],
    entities: []
  },
  {
    category: 'Scheduling',
    subject: 'URGENT: Postponing today\'s sync',
    body: 'Hey, something urgent came up and I cannot make our weekly sync today at 3:00 PM. Can we postpone it to tomorrow morning at 9:30 AM? Let me know if that works.',
    reply: 'Hi, no problem at all. We have moved today\'s weekly sync to tomorrow morning at 9:30 AM EST. The calendar event has been updated accordingly. Hope everything goes well with your urgent matter.',
    intent: 'Postpone weekly sync to tomorrow',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['postpone', 'sync', 'reschedule', 'urgent'],
    action_items: ['Update today\'s calendar invite to tomorrow at 9:30 AM EST'],
    entities: [{ type: 'Time', value: '9:30 AM EST' }]
  },
  {
    category: 'Scheduling',
    subject: 'Board meeting date confirmation',
    body: 'Dear team, could you please confirm if the upcoming Board Meeting is scheduled for October 15th or October 16th? We need to finalize the hotel bookings for our board members.',
    reply: 'Dear Board Coordinator, we can confirm that the upcoming Board Meeting is officially scheduled for October 15th, starting at 9:00 AM EST. All logistics and agenda items will be sent out by the end of this week.',
    intent: 'Confirm board meeting date',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['board meeting', 'confirm', 'date', 'logistics'],
    action_items: ['Confirm October 15th date', 'Prepare logistics email'],
    entities: [{ type: 'Date', value: 'October 15th' }]
  },
  {
    category: 'Scheduling',
    subject: 'Interview reschedule request - Software Engineer role',
    body: 'Hello Support, I have a technical interview scheduled for tomorrow at 2:00 PM. Unfortunately, I have a personal emergency. Is it possible to reschedule to Friday morning?',
    reply: 'Hello, thank you for letting us know. We understand that emergencies happen. We have successfully rescheduled your technical interview for the Software Engineer role to Friday at 10:00 AM EST. You will receive a new Google Meet link in your calendar invite.',
    intent: 'Reschedule candidate interview',
    difficulty: 'Medium',
    tone: 'Friendly',
    keywords: ['interview', 'reschedule', 'candidate', 'engineering'],
    action_items: ['Update Google Meet link', 'Reschedule interview in ATS'],
    entities: [{ type: 'Date', value: 'Friday' }]
  },

  // ==================== CATEGORY: HR (5) ====================
  {
    category: 'HR',
    subject: 'Query regarding dental insurance coverage',
    body: 'Hi HR team, I am trying to understand if dental cleaning is covered 100% under our basic health plan, or if there is a co-pay. Could you please clarify?',
    reply: 'Hi, under our company\'s basic health insurance plan, routine dental cleanings are covered 100% twice per calendar year with no co-pay required. For major dental work, a 20% co-pay applies. Let us know if you need the full policy brochure.',
    intent: 'Clarify dental insurance coverage policy',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['dental', 'insurance', 'coverage', 'copay', 'benefits'],
    action_items: ['Confirm coverage parameters', 'Send insurance brochure if requested'],
    entities: []
  },
  {
    category: 'HR',
    subject: 'Maternity leave policy document request',
    body: 'Hello, could someone please send me the latest PDF version of the Maternity Leave policy document? I need to review the guidelines for submitting my leave request.',
    reply: 'Hello, congratulations! We have attached the latest Maternity Leave Policy PDF to this email. It outlines the paid leave duration (16 weeks), benefit details, and step-by-step instructions for submitting your formal request in Workday.',
    intent: 'Request maternity leave policy PDF',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['maternity', 'leave', 'policy', 'workday', 'benefits'],
    action_items: ['Attach Maternity Leave Policy PDF'],
    entities: []
  },
  {
    category: 'HR',
    subject: 'Referral bonus payout schedule',
    body: 'Hey HR, I referred a candidate who was hired and started on April 1st. According to our policy, when should I expect the referral bonus to show in my paycheck?',
    reply: 'Hi, referral bonuses are processed and paid out after the referred employee successfully completes their first 90 days of employment. Since your referral started on April 1st, they will hit 90 days on June 30th, meaning your bonus will be included in the July 15th paycheck.',
    intent: 'Query referral bonus payout date',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['referral', 'bonus', 'payout', 'paycheck', 'payroll'],
    action_items: ['Verify candidate retention status', 'Schedule bonus payout for July 15th payroll'],
    entities: [{ type: 'Date', value: 'April 1st' }, { type: 'Date', value: 'July 15th' }]
  },
  {
    category: 'HR',
    subject: 'Address change request for payroll tax forms',
    body: 'Hi payroll, I recently moved to a new apartment. Can you please update my primary home address for tax withholding and W2 purposes? The new address is 742 Evergreen Terrace, Springfield.',
    reply: 'Hi, we have updated your primary address to 742 Evergreen Terrace, Springfield, in our payroll system. Please make sure to also update your address in the Workday portal under Personal Information to ensure all future tax mailings go to the correct location.',
    intent: 'Change home address in payroll system',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['address', 'payroll', 'w2', 'tax', 'workday'],
    action_items: ['Update payroll address record', 'Monitor Workday sync status'],
    entities: [{ type: 'Address', value: '742 Evergreen Terrace, Springfield' }]
  },
  {
    category: 'HR',
    subject: 'Tuition reimbursement approval guidelines',
    body: 'Hello HR, does the company reimburse tuition for external online courses that are related to my current engineering job? If so, what is the annual cap on reimbursement?',
    reply: 'Hello, yes, the company supports professional development. We offer tuition reimbursement for job-related courses up to an annual cap of $5,000. To receive reimbursement, the course must be pre-approved by your manager and you must achieve a grade of B or higher.',
    intent: 'Inquire about tuition reimbursement cap and rules',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['tuition', 'reimbursement', 'learning', 'courses', 'benefits'],
    action_items: ['Verify course relevance', 'Process reimbursement request form'],
    entities: [{ type: 'Money', value: '$5,000' }]
  },

  // ==================== CATEGORY: Support (5) ====================
  {
    category: 'Customer Support',
    subject: 'Cannot login to account - error code 403',
    body: 'Hello, I am trying to access my dashboard but I keep receiving a 403 Forbidden error screen. Can you please help me unlock my account? My username is admin_user1.',
    reply: 'Hello, we have checked our server logs and found that your account (admin_user1) was temporarily locked due to multiple failed login attempts. We have unlocked your account, cleared the session lock, and sent a password reset link to your email.',
    intent: 'Unlock account for locked user',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['login', 'error 403', 'locked', 'password reset'],
    action_items: ['Unlock account admin_user1', 'Send password reset link'],
    entities: [{ type: 'Username', value: 'admin_user1' }]
  },
  {
    category: 'Customer Support',
    subject: 'API key limit reached notification query',
    body: 'Hi support, we received an email saying our API key reached its daily requests limit. Can you please explain how we can upgrade our limits or buy add-ons?',
    reply: 'Hi there, your current subscription tier allows up to 10,000 API requests per day. You can easily upgrade your limit by navigating to Billing > API Add-ons in your console and selecting the 50k daily package, which costs an additional $29/month.',
    intent: 'API key quota upgrade inquiry',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['api limit', 'upgrade', 'add-ons', 'subscription'],
    action_items: ['Provide billing navigation instructions', 'Outline package options'],
    entities: [{ type: 'Money', value: '$29' }]
  },
  {
    category: 'Customer Support',
    subject: 'Data export request from account dashboard',
    body: 'Hello, I need to export all my customer contact lists as a CSV file to import them into our CRM. I don\'t see any export button on the UI. Can you help?',
    reply: 'Hello, you can export your contact lists by going to Contacts > Settings > Export Data on the sidebar navigation. We have also generated a secure zip file containing your complete contacts database and attached it directly to this ticket.',
    intent: 'Export contacts database to CSV',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['export', 'contacts', 'csv', 'crm', 'settings'],
    action_items: ['Generate CSV export zip', 'Attach contacts file to support response'],
    entities: []
  },
  {
    category: 'Customer Support',
    subject: 'Incorrect pricing on billing page',
    body: 'Hi, I signed up for the $19 plan, but my billing page is showing $49. Please correct this immediately before I am charged next week.',
    reply: 'Hi, we apologize for the confusion. We checked your account registration and confirmed you were mistakenly placed on the Enterprise plan instead of the Standard plan. We have adjusted your subscription rate back to $19/month and applied a $30 credit to your billing page.',
    intent: 'Correct billing subscription tier discrepancy',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['pricing', 'billing error', 'subscription', 'credit'],
    action_items: ['Downgrade plan to $19/month', 'Apply $30 account credit'],
    entities: [{ type: 'Money', value: '$19' }, { type: 'Money', value: '$30' }]
  },
  {
    category: 'Customer Support',
    subject: 'White labeling domain configuration',
    body: 'Hello support team, we want to configure white labeling for our emails using the domain mail.ourbusiness.com. Could you please send us the CNAME records we need to add to our DNS settings?',
    reply: 'Hello, to configure white labeling for mail.ourbusiness.com, please add a CNAME record in your DNS provider pointing to custom.mailsense.com, and a TXT record for SPF: "v=spf1 include:spf.mailsense.com ~all". Once DNS propagates, click Verify in your settings.',
    intent: 'Provide DNS records for white-labeling',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['dns', 'cname', 'white label', 'spf', 'custom domain'],
    action_items: ['Provide DNS records', 'Instruct verification steps'],
    entities: [{ type: 'Domain', value: 'mail.ourbusiness.com' }]
  },

  // ==================== CATEGORY: Finance (5) ====================
  {
    category: 'Finance',
    subject: 'Budget allocation status for marketing campaign',
    body: 'Hi Finance, can you please confirm if the Q4 marketing campaign budget of $25,000 has been approved? We need to start booking ad placements this week.',
    reply: 'Hi Marketing team, we can confirm that the Q4 campaign budget of $25,000 was officially approved yesterday. The finance code for these expenses is MKT-2026-Q4. Please reference this code in all vendor invoices.',
    intent: 'Confirm budget approval status',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['budget', 'marketing', 'approval', 'finance code'],
    action_items: ['Provide approved finance code', 'Log budget clearance'],
    entities: [{ type: 'Money', value: '$25,000' }]
  },
  {
    category: 'Finance',
    subject: 'Wire transfer instructions request - USD Account',
    body: 'Hello, our client in Europe wants to settle their outstanding invoice via direct bank wire. Could you please send over our company bank details, including routing number and SWIFT code?',
    reply: 'Hello, our bank details for USD wire transfers are: Bank: Chase National, Account: 987654321, Routing (ABA): 021000021, SWIFT Code: CHASUS33. Please ensure the client includes the invoice number in the memo field.',
    intent: 'Provide wire transfer details',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['wire transfer', 'swift', 'routing', 'bank details'],
    action_items: ['Provide Chase routing/account details', 'Send SWIFT parameters'],
    entities: [{ type: 'Bank Name', value: 'Chase National' }]
  },
  {
    category: 'Finance',
    subject: 'Quarterly sales tax return calculation discrepancy',
    body: 'Dear Finance, our internal tax calculator shows a sales tax discrepancy of $1,240 for California region sales in Q2. Can you review our tax transaction report and let us know which calculations are correct?',
    reply: 'Dear Operations, we have audited the Q2 transactions and confirmed your calculation of $1,240 is correct. The discrepancy was caused by an outdated tax rate applied to California shipping charges. We have corrected the tax ledger and will file the amended return tomorrow.',
    intent: 'Audit and resolve sales tax ledger discrepancy',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['sales tax', 'discrepancy', 'audit', 'tax return'],
    action_items: ['Amend sales tax ledger entry', 'Prepare tax filing revision'],
    entities: [{ type: 'Money', value: '$1,240' }]
  },
  {
    category: 'Finance',
    subject: 'Corporate credit card limit increase request',
    body: 'Hi Finance, I am traveling next week for the annual sales conference and need to pay for hotel bookings and team dinners. Can we temporarily increase my credit card limit to $10,000?',
    reply: 'Hi, we have reviewed your travel itinerary and approved a temporary limit increase to $10,000 on your corporate card ending in 4321. This increase is active until next Friday, July 17th. Travel safe.',
    intent: 'Increase corporate card credit limit',
    difficulty: 'Medium',
    tone: 'Friendly',
    keywords: ['credit card', 'limit increase', 'travel', 'expenses'],
    action_items: ['Activate limit extension in card provider portal'],
    entities: [{ type: 'Money', value: '$10,000' }, { type: 'Date', value: 'July 17th' }]
  },
  {
    category: 'Finance',
    subject: 'Expense report reimbursement delay query',
    body: 'Hello Finance, I submitted my travel expense report (EXP-889) two weeks ago, but it is still showing as "Pending Audit". When can I expect the reimbursement direct deposit?',
    reply: 'Hello, we apologize for the delay. Expense report EXP-889 had a missing hotel receipt which was flagged during audit. We have bypassed the minor flag and approved the report for payment. The funds will be deposited in the next payroll run on Friday.',
    intent: 'Speed up pending expense report audit',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['expense report', 'reimbursement', 'audit', 'direct deposit'],
    action_items: ['Override receipt flag', 'Clear EXP-889 for payroll deposit'],
    entities: [{ type: 'Code', value: 'EXP-889' }]
  },

  // ==================== CATEGORY: Sales (5) ====================
  {
    category: 'Sales',
    subject: 'Pricing inquiry for enterprise license (50+ users)',
    body: 'Hello, our organization is looking to purchase 60 enterprise seats. Do we qualify for a bulk discount, and could you please send us a formal proposal with pricing tiers?',
    reply: 'Hello, thank you for reaching out. Yes, we offer volume discounting for seats above 50. For 60 enterprise seats, we can offer a discounted rate of $15/user/month (standard rate is $22). We have attached a formal contract proposal with the tier breakdown.',
    intent: 'Enterprise volume discounting request',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['pricing', 'enterprise', 'seats', 'discount', 'proposal'],
    action_items: ['Attach formal sales proposal PDF', 'Set custom rate to $15/seat'],
    entities: [{ type: 'Money', value: '$15' }, { type: 'SeatsCount', value: '60' }]
  },
  {
    category: 'Sales',
    subject: 'Request for custom NDA before agreement review',
    body: 'Hi, we are interested in moving forward with your sales engagement, but our legal department requires that you sign our mutual NDA before we can share our security requirements. Please sign the attached document.',
    reply: 'Hi there, thank you for sending over the mutual NDA. We have reviewed the terms, signed the document, and attached the executed copy to this email. Please feel free to share your security requirements at your earliest convenience.',
    intent: 'Execute customer mutual NDA',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['nda', 'legal review', 'agreement', 'security'],
    action_items: ['Sign NDA document', 'Attach executed copy'],
    entities: []
  },
  {
    category: 'Sales',
    subject: 'Billing frequency change - annual payments discount',
    body: 'Hello sales team, we are currently paying monthly for our subscription. Is there a discount if we switch to annual billing, and how can we make that change?',
    reply: 'Hello, switching to annual billing saves you 20% overall (equivalent to getting 2 months free). We have upgraded your subscription to Annual Billing starting today. A receipt for the prorated difference has been emailed to you.',
    intent: 'Change monthly subscription to annual billing',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['annual billing', 'discount', 'subscription change', 'invoice'],
    action_items: ['Update billing cycle to annual', 'Apply 20% discount code'],
    entities: []
  },
  {
    category: 'Sales',
    subject: 'Reseller partnership onboarding query',
    body: 'Dear Sales, our agency wants to become an official reseller partner for your platform in APAC. What is the commission margin structure, and how do we apply?',
    reply: 'Dear APAC Agency, our Reseller Program offers a 25% recurring commission for all customer contracts referred and managed by your agency. We have attached our Partner Onboarding Guide and the partnership application form.',
    intent: 'Inquire about APAC reseller program commission',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['partnership', 'reseller', 'commission', 'apac', 'onboarding'],
    action_items: ['Attach Onboarding Guide PDF', 'Send partner application form'],
    entities: [{ type: 'Percentage', value: '25%' }]
  },
  {
    category: 'Sales',
    subject: 'Postponing sales pilot contract',
    body: 'Hey Sales, due to budget cuts in our IT department, we need to delay our planned software pilot from July 1st to September 1st. Can you update the contract dates accordingly?',
    reply: 'Hi, we understand these decisions happen. We have updated the pilot service contract start date to September 1st, 2026. The revised agreement is attached. We look forward to kicking off the engagement then.',
    intent: 'Delay pilot agreement start date',
    difficulty: 'Medium',
    tone: 'Friendly',
    keywords: ['pilot delay', 'contract update', 'budget cuts', 'it department'],
    action_items: ['Revise contract date to Sept 1st', 'Attach revised pilot contract PDF'],
    entities: [{ type: 'Date', value: 'September 1st, 2026' }]
  },

  // ==================== CATEGORY: Recruitment (5) ====================
  {
    category: 'Recruitment',
    subject: 'Interview details - Lead Product Designer candidate',
    body: 'Hello Recruitment team, I have a coding and design challenge scheduled for tomorrow. Will it be a live session or a take-home assignment? Please clarify the format.',
    reply: 'Hello Candidate, the design challenge for the Lead Product Designer role is a 48-hour take-home assignment. We will email the details and design brief tomorrow morning at 9:00 AM EST. You will not need to code live tomorrow.',
    intent: 'Clarify interview design challenge format',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['design challenge', 'take-home', 'interview', 'format'],
    action_items: ['Send design brief at 9:00 AM EST tomorrow'],
    entities: []
  },
  {
    category: 'Recruitment',
    subject: 'Reference checks submission - Sarah Jenkins',
    body: 'Hi recruitment, I had my final round interviews last Friday and wanted to send over the contact details for my professional references as requested by the hiring manager.',
    reply: 'Hi Sarah, thank you for providing your references. We have received the contact details and will begin the reference checks this afternoon. We will keep you updated on the progress of your application.',
    intent: 'Receive candidate references details',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['references', 'hiring manager', 'interview progress', 'recruiting'],
    action_items: ['Initiate reference check outreach'],
    entities: [{ type: 'Person', value: 'Sarah Jenkins' }]
  },
  {
    category: 'Recruitment',
    subject: 'Job application status - Senior Developer role',
    body: 'Hello, I applied for the Senior Developer position three weeks ago and have not received any feedback. Could you please confirm the current status of my application?',
    reply: 'Hello, thank you for following up. Your application for the Senior Developer role is currently under review by our hiring team. We are wrapping up initial candidate screenings this week and expect to send out interview invitations by next Tuesday.',
    intent: 'Provide application status update',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['application status', 'developer', 'review', 'recruitment'],
    action_items: ['Mark candidate record for review follow-up'],
    entities: []
  },
  {
    category: 'Recruitment',
    subject: 'Salary range inquiry for DevOps Engineer vacancy',
    body: 'Dear Recruiting, I was contacted by one of your sourcers regarding the open DevOps Engineer vacancy. Before we schedule a call, could you please provide the base salary range?',
    reply: 'Dear Candidate, the base salary range for our open DevOps Engineer position is $130,000 to $160,000 per year, depending on experience. We also offer a 10% annual performance bonus, comprehensive benefits, and stock options.',
    intent: 'Inquire about DevOps vacancy salary range',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['salary range', 'devops', 'compensation', 'benefits'],
    action_items: ['Record salary range communication in CRM'],
    entities: [{ type: 'Money', value: '$130,000 - $160,000' }]
  },
  {
    category: 'Recruitment',
    subject: 'Official offer letter acceptance & start date',
    body: 'Hi HR Recruitment, I am thrilled to accept the offer for the Account Executive position! I have signed the offer letter. I want to confirm my start date is August 3rd.',
    reply: 'Hi Candidate, welcome to the team! We have received your signed offer letter and are excited to have you join. Your start date is confirmed for Monday, August 3rd. Our onboarding coordinator will send your laptop details next week.',
    intent: 'Confirm offer letter receipt and start date',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['offer letter', 'accept', 'onboarding', 'start date'],
    action_items: ['Mark hire as accepted in ATS', 'Trigger onboarding workflow'],
    entities: [{ type: 'Date', value: 'August 3rd' }]
  },

  // ==================== CATEGORY: Technical Support (5) ====================
  {
    category: 'Technical Support',
    subject: 'SSL Certificate expired warning on client site',
    body: 'Dear Support, our website is displaying a "Connection Not Private" security warning. It looks like the SSL certificate expired today. Please renew it immediately.',
    reply: 'Dear Customer, we have renewed the Let\'s Encrypt SSL certificate for your website. The certificate is now valid, and your site is fully secure with HTTPS. Please clear your browser cache and refresh the page to verify.',
    intent: 'Renew expired SSL certificate for HTTPS',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['ssl', 'expired', 'connection not private', 'certificate', 'https'],
    action_items: ['Trigger SSL renewal script', 'Verify HTTPS connectivity'],
    entities: []
  },
  {
    category: 'Technical Support',
    subject: 'Slow database query performance in production',
    body: 'Hi engineering support, our analytics dashboard is timing out when querying logs from June. We suspect a missing database index. Can you review this index setup?',
    reply: 'Hi, we investigated the Q2 query logs and confirmed a missing composite index on (org_id, created_at) inside the activity_logs table. We have successfully created the index. Query runtimes dropped from 8.2 seconds to 12 milliseconds.',
    intent: 'Add database index to resolve slow queries',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['database index', 'performance', 'query timeout', 'postgres'],
    action_items: ['Apply database migration index script', 'Verify query execution plan'],
    entities: []
  },
  {
    category: 'Technical Support',
    subject: 'Webhooks failing with 502 Bad Gateway',
    body: 'Hello support, we are noticing that our webhook notifications to endpoint https://api.customer.com/webhooks are failing with a 502 error code. Can you resend the failed webhooks?',
    reply: 'Hello, we investigated our webhook dispatch log and verified 14 deliveries failed due to your target server timeout. We have triggered a manual retry queue to replay those 14 failed webhooks now. Let us know if they arrive.',
    intent: 'Replay failed webhook delivery logs',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['webhooks', '502 bad gateway', 'failed delivery', 'retry queue'],
    action_items: ['Trigger webhook replay job for 14 payloads'],
    entities: [{ type: 'URL', value: 'https://api.customer.com/webhooks' }]
  },
  {
    category: 'Technical Support',
    subject: 'Integrating custom tracking script - HTML tags',
    body: 'Hi tech support, we want to add our Google Tag Manager script to the platform. Where exactly do we insert the header tracking script inside the app console?',
    reply: 'Hi there, you can configure your tracking codes by navigating to Settings > Integration > Custom Scripts in your admin dashboard. Paste the GTM code snippet inside the "Header Scripts" textarea and click Save Changes.',
    intent: 'GTM tracking code integration steps',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['google tag manager', 'tracking script', 'integration', 'headers'],
    action_items: ['Verify custom scripts access status'],
    entities: []
  },
  {
    category: 'Technical Support',
    subject: 'Resetting MFA / Two-Factor Authentication',
    body: 'Hello Support, I lost my authenticator device and cannot bypass the 2FA screen during login. Can you please temporarily disable MFA on my account so I can reset it?',
    reply: 'Hello, we have disabled Two-Factor Authentication on your profile after validating your security details. Please login, go to Profile Settings > Security, and scan the new QR code to set up your MFA token again immediately.',
    intent: 'Reset candidate multi-factor authentication locks',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['mfa reset', 'two factor', 'authenticator', 'security'],
    action_items: ['Deactivate MFA on profile record'],
    entities: []
  },

  // ==================== CATEGORY: Legal (5) ====================
  {
    category: 'Legal',
    subject: 'IP Ownership Clause in Service Agreement',
    body: 'Hi, we are reviewing your master service agreement. We need to confirm that all IP rights for deliverables developed during this contract will be transferred to our company.',
    reply: 'Hi team, we can confirm that according to Section 8.2 of our Master Service Agreement, all Intellectual Property rights for custom work deliverables developed specifically for your company are fully assigned to you upon receipt of final payment.',
    intent: 'Clarify IP deliverables ownership clause parameters',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['ip rights', 'agreement review', 'intellectual property', 'contract'],
    action_items: ['Confirm section 8.2 transfer language'],
    entities: []
  },
  {
    category: 'Legal',
    subject: 'GDPR Data Processing Addendum signature',
    body: 'Dear Legal, we need to ensure our operations comply with GDPR rules. Could you please send us your standard signed Data Processing Addendum (DPA) for our compliance files?',
    reply: 'Dear Compliance Team, we have attached our pre-signed Data Processing Addendum (DPA) which incorporates the latest EU Standard Contractual Clauses (SCCs). Please sign and return a copy to our legal inbox.',
    intent: 'Send pre-signed DPA for customer files',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['gdpr', 'data processing addendum', 'scc', 'compliance'],
    action_items: ['Attach pre-signed DPA PDF'],
    entities: []
  },
  {
    category: 'Legal',
    subject: 'Contract Clarification and August 15th Timeline',
    body: 'Thank you for sending over the agreement. Before we proceed, I need clarification on a few points. First, the payment schedule in Section 4 appears to conflict with what we discussed during last week\'s meeting. Second, could you confirm whether the maintenance services are included for the first year or billed separately? Finally, we are aiming to begin implementation on August 15th. Please let us know if that timeline is still feasible.',
    reply: 'Dear Client, thank you for reaching out. We are happy to clarify these points: First, we will adjust Section 4 to reflect our meeting discussion, ensuring the payment schedule is aligned. Second, we confirm that maintenance services are included at no additional cost for the first year. Finally, the August 15th implementation timeline is fully feasible, and we will update the agreement to reflect this start date.',
    intent: 'Clarify payment conflict, maintenance inclusion, and August 15th start date feasibility',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['agreement review', 'payment schedule', 'maintenance coverage', 'timeline', 'implementation'],
    action_items: ['Revise Section 4 payment schedule', 'Confirm 1st year maintenance coverage', 'Confirm August 15th start date'],
    entities: [{ type: 'Date', value: 'August 15th' }]
  },
  {
    category: 'Legal',
    subject: 'Liability limits in corporate proposal',
    body: 'Hello team, our insurance provider requires that our software agreements have a liability cap equal to 12 months of contract value. Does your standard SLA support this?',
    reply: 'Hello, yes, our standard Master Service Agreement has a limitation of liability capped at the total fees paid by you in the 12 months preceding the event. This complies with standard insurance requirements.',
    intent: 'Confirm limitation of liability parameters',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['liability cap', 'insurance', 'sla', 'contract value'],
    action_items: ['Provide section 12 reference details'],
    entities: []
  },
  {
    category: 'Legal',
    subject: 'NDA validity period clarification',
    body: 'Hi Legal, we signed a non-disclosure agreement with your organization back in 2023. Can you tell us what the confidentiality term duration is for this NDA?',
    reply: 'Hi, we checked the NDA executed on October 14, 2023. According to Section 5, the confidentiality obligations regarding disclosed proprietary information remain in effect for a term of five (5) years from the date of disclosure.',
    intent: 'Determine NDA confidentiality term duration',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['nda duration', 'confidentiality term', 'contract check'],
    action_items: ['Retrieve archived 2023 NDA record'],
    entities: [{ type: 'Date', value: 'October 14, 2023' }]
  },

  // ==================== CATEGORY: Complaints (5) ====================
  {
    category: 'Complaints',
    subject: 'Poor system uptime over the weekend',
    body: 'Hi, our service was down for over 4 hours this Sunday during critical batch runs. This caused delayed deliveries for our clients. We expect a SLA credit.',
    reply: 'Hello, we sincerely apologize for the system outage on Sunday. The service disruption was caused by an unexpected database replication failure. We have completed the incident audit and credited your account for 5% of your monthly subscription fee, in accordance with our SLA.',
    intent: 'Issue SLA credit for weekend service outage',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['outage', 'downtime', 'sla credit', 'reimbursement'],
    action_items: ['Calculate SLA outage percentage', 'Apply 5% credit to invoice'],
    entities: [{ type: 'OutageDuration', value: '4 hours' }]
  },
  {
    category: 'Complaints',
    subject: 'Unhelpful support ticket resolution',
    body: 'Hello, I opened a ticket yesterday about an API bug, and it was closed without any explanation. This is completely unacceptable support service.',
    reply: 'Hello, we sincerely apologize for the poor experience. It looks like your ticket was closed due to an agent error during a queue migration. We have reopened your ticket and assigned it to our senior engineering lead for immediate resolution.',
    intent: 'Reopen incorrectly closed support ticket',
    difficulty: 'Medium',
    tone: 'Friendly',
    keywords: ['agent error', 'reopen ticket', 'complaint', 'escalation'],
    action_items: ['Reopen ticket in Zendesk', 'Escalate to engineering lead'],
    entities: []
  },
  {
    category: 'Complaints',
    subject: 'Incorrect charges on expired account',
    body: 'Hi, I canceled my subscription last month, but I was charged again today. Please refund this transaction immediately and close my account permanently.',
    reply: 'Hi, we apologize for the automated billing error. We verified that your account cancellation request on June 15th did not propagate to our payment gateway. We have processed a full refund of $49 for today\'s charge and deactivated the account.',
    intent: 'Refund mistaken post-cancellation subscription charge',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['cancellation error', 'refund', 'unauthorized charge', 'stripe'],
    action_items: ['Process refund in Stripe portal', 'Deactivate subscription status'],
    entities: [{ type: 'Money', value: '$49' }]
  },
  {
    category: 'Complaints',
    subject: 'Delays in customer delivery onboarding',
    body: 'Hey support, we were promised that our onboarding would be finished in 3 days. It has now been a week and we still don\'t have our sandbox key active.',
    reply: 'Hello, we apologize for the delay. Your onboarding was held up by a domain verification delay. We have bypassed the manual check and activated your sandbox key. You should receive your access credentials within 10 minutes.',
    intent: 'Escalate and bypass onboarding blockages',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['onboarding delay', 'sandbox access', 'escalation'],
    action_items: ['Manually approve domain verify', 'Generate sandbox keys'],
    entities: []
  },
  {
    category: 'Complaints',
    subject: 'Platform latency and slow API response',
    body: 'Hi there, our server integrations are getting API response latencies above 2000ms today. This is slowing down our order processing pipeline. Please fix this.',
    reply: 'Hi, we apologize for the performance issues. Our engineering team identified high load on our US-East region database cluster. We have added a read-replica node to balance the query load. API latencies have returned to below 150ms.',
    intent: 'Resolve high server latency incident',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['latency', 'slow api', 'replica', 'server load'],
    action_items: ['Spin up read replica instance', 'Monitor database query times'],
    entities: []
  },

  // ==================== CATEGORY: Invoices (5) ====================
  {
    category: 'Invoices',
    subject: 'Missing PDF invoice for June transaction',
    body: 'Hi team, I noticed that my credit card was billed $99 yesterday, but I did not receive the corresponding PDF invoice in my email. Please send it over.',
    reply: 'Hi, thank you for contacting billing support. We have attached the PDF invoice for your June transaction of $99 (Invoice #INV-2026-06) to this email. You can also download all historical invoices from the Billing > History tab.',
    intent: 'Provide missing monthly transaction invoice PDF',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['invoice', 'pdf request', 'billing', 'receipt'],
    action_items: ['Attach Invoice PDF INV-2026-06'],
    entities: [{ type: 'Money', value: '$99' }, { type: 'InvoiceNo', value: 'INV-2026-06' }]
  },
  {
    category: 'Invoices',
    subject: 'Wrong billing address on invoice #2290',
    body: 'Hello Finance, invoice #2290 contains our old corporate address in New York. Can you please re-issue the invoice with our new address: 500 California St, San Francisco?',
    reply: 'Hello, we have updated your billing profile address to 500 California St, San Francisco, and regenerated invoice #2290. The updated invoice is attached to this email. Please review and process for payment.',
    intent: 'Reissue invoice with updated address',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['billing address', 'invoice update', 'reissue'],
    action_items: ['Update profile address parameters', 'Regenerate Invoice #2290'],
    entities: [{ type: 'Address', value: '500 California St, San Francisco' }]
  },
  {
    category: 'Invoices',
    subject: 'Duplicate charge on invoice payment',
    body: 'Hi billing team, I paid invoice #389 yesterday, but my credit card statement shows two identical charges of $150. Please check and void the duplicate payment.',
    reply: 'Hi, we checked our payment gateway records and confirmed that invoice #389 was charged twice due to a network timeout during submission. We have successfully voided and refunded the duplicate charge of $150. You should see the credit in 2-3 business days.',
    intent: 'Void and refund duplicate card charge',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['duplicate payment', 'refund', 'card statement', 'void transaction'],
    action_items: ['Identify duplicate charge ID in gateway', 'Execute transaction void'],
    entities: [{ type: 'Money', value: '$150' }]
  },
  {
    category: 'Invoices',
    subject: 'Request for W9 tax form from vendor',
    body: 'Hello, our accounts payable department needs a signed copy of your W9 form before we can clear your invoice for payment. Please send the document at your earliest convenience.',
    reply: 'Hello, we have attached our signed and dated 2026 W9 form (W-9.pdf) to this email. Please forward it to your accounts payable department to complete the vendor setup. Let us know if you need any additional documentation.',
    intent: 'Provide signed vendor W9 form',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['w9 form', 'accounts payable', 'tax form', 'vendor setup'],
    action_items: ['Attach W9 PDF file'],
    entities: []
  },
  {
    category: 'Invoices',
    subject: 'Payment extension request for INV-550',
    body: 'Hi finance, our corporate treasury is running a cash-flow reconciliation and we won\'t be able to settle invoice INV-550 by the July 1st deadline. Can we get an extension to July 15th?',
    reply: 'Hi, we understand the request. We have adjusted the payment terms for invoice INV-550 to July 15th. No late fees or finance charges will be applied. The updated invoice is attached.',
    intent: 'Extend invoice payment deadline due date',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['payment extension', 'due date', 'late fees', 'finance terms'],
    action_items: ['Update INV-550 payment due date to July 15th'],
    entities: [{ type: 'Date', value: 'July 15th' }]
  },

  // ==================== CATEGORY: Refunds (5) ====================
  {
    category: 'Refunds',
    subject: 'Refund request for unused subscription month',
    body: 'Hi support, my subscription renewed automatically yesterday, but I haven\'t logged in or used the service this month. Can I get a refund for this charge of $39?',
    reply: 'Hi there, we have reviewed your account logs and confirmed zero usage since renewal. We have processed a full refund of $39 for yesterday\'s charge. The refund will show on your card in 5-10 business days.',
    intent: 'Refund unused subscription charge',
    difficulty: 'Easy',
    tone: 'Friendly',
    keywords: ['refund', 'subscription', 'renewal', 'usage check'],
    action_items: ['Verify usage metrics', 'Execute refund in Stripe'],
    entities: [{ type: 'Money', value: '$39' }]
  },
  {
    category: 'Refunds',
    subject: 'Accidental double purchase refund request',
    body: 'Hello, I accidentally bought the same course license twice during checkout. Can you please refund the duplicate purchase? The order reference is ORD-990-2.',
    reply: 'Hello, we have confirmed the accidental double purchase for order ORD-990-2. We have successfully canceled the second license and processed a refund of $75 to your payment card. You will retain access via the first license.',
    intent: 'Refund duplicate checkout order license',
    difficulty: 'Easy',
    tone: 'Professional',
    keywords: ['refund', 'double purchase', 'license cancel', 'order reference'],
    action_items: ['Cancel duplicate license ORD-990-2', 'Trigger refund of $75'],
    entities: [{ type: 'Money', value: '$75' }, { type: 'OrderRef', value: 'ORD-990-2' }]
  },
  {
    category: 'Refunds',
    subject: 'Damaged item return and refund status',
    body: 'Dear support, I returned the damaged monitoring unit (tracking #1Z8829) last week. Please confirm if you received it and when my refund will be processed.',
    reply: 'Dear customer, we received the returned monitoring unit at our warehouse yesterday. We have approved the return and processed a full refund of $120. The refund has been credited back to your original payment method.',
    intent: 'Confirm return delivery and issue refund',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['refund', 'return delivery', 'damaged item', 'warehouse check'],
    action_items: ['Log return completion', 'Process refund in ERP'],
    entities: [{ type: 'Money', value: '$120' }]
  },
  {
    category: 'Refunds',
    subject: 'Refund request for cancelled flight booking',
    body: 'Hi support, I had to cancel my corporate travel booking (REF-9988) due to meeting cancellations. Am I eligible for a full refund of $450, or only credit?',
    reply: 'Hi, according to the airline policy for refundable ticket REF-9988, you are eligible for a full cash refund. We have processed the refund of $450 back to your company credit card. The transaction should clear in 5 business days.',
    intent: 'Verify refund eligibility and issue cash refund',
    difficulty: 'Hard',
    tone: 'Professional',
    keywords: ['refund eligibility', 'airline policy', 'travel booking', 'credit card'],
    action_items: ['Validate fare code rules', 'Trigger card refund transaction'],
    entities: [{ type: 'Money', value: '$450' }, { type: 'BookingID', value: 'REF-9988' }]
  },
  {
    category: 'Refunds',
    subject: 'Refund status query - transaction #8229',
    body: 'Hello Finance, you emailed me saying refund #8229 was processed on June 1st. It has been two weeks and I still don\'t see the credit on my card. Can you check?',
    reply: 'Hello, we investigated with our merchant gateway and verified the refund transaction was settled on June 1st. Sometimes banks take up to 10 business days to post credits. We have attached the Acquirer Reference Number (ARN) receipt so your bank can track the transaction.',
    intent: 'Provide ARN tracking number for delayed refund',
    difficulty: 'Medium',
    tone: 'Professional',
    keywords: ['refund status', 'delayed credit', 'arn number', 'bank tracking'],
    action_items: ['Retrieve ARN invoice document', 'Attach ARN receipt to email'],
    entities: []
  }
];

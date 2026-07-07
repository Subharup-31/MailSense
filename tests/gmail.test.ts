import { describe, it, expect } from 'vitest';
import { cleanHtml, normalizeEmail } from '../lib/composio';

describe('Gmail Integration Utilities', () => {

  describe('HTML Text Cleaning', () => {
    it('should strip script and style tags completely', () => {
      const html = '<html><head><style>body { color: red; }</style></head><body><script>alert("hello")</script><div>Hello World</div></body></html>';
      const cleaned = cleanHtml(html);
      expect(cleaned).toBe('Hello World');
    });

    it('should format paragraph, header, and linebreaks correctly', () => {
      const html = '<h1>Title</h1><p>First paragraph.</p><br/>Second line.<div>Div content.</div>';
      const cleaned = cleanHtml(html);
      expect(cleaned).toContain('Title');
      expect(cleaned).toContain('First paragraph.');
      expect(cleaned).toContain('Second line.');
      expect(cleaned).toContain('Div content.');
    });

    it('should decode HTML entities', () => {
      const html = 'Hello &amp; welcome to &quot;MailSense&quot; &lt;support&gt;';
      const cleaned = cleanHtml(html);
      expect(cleaned).toBe('Hello & welcome to "MailSense" <support>');
    });
  });

  describe('Email Normalization', () => {
    it('should normalize simple flat message objects correctly', () => {
      const msg = {
        id: 'msg_123',
        threadId: 'thread_456',
        subject: 'Invoice Inquiry',
        body: 'Hello, please send the invoice.',
        sender: 'Sarah Connor <sarah@sky.net>',
        to: ['support@mailsense.ai'],
        date: '2026-07-07T12:00:00.000Z',
        labels: ['INBOX', 'UNREAD'],
      };

      const normalized = normalizeEmail(msg);
      expect(normalized.id).toBe('msg_123');
      expect(normalized.threadId).toBe('thread_456');
      expect(normalized.subject).toBe('Invoice Inquiry');
      expect(normalized.body).toBe('Hello, please send the invoice.');
      expect(normalized.sender).toBe('Sarah Connor <sarah@sky.net>');
      expect(normalized.recipients).toContain('support@mailsense.ai');
      expect(normalized.isRead).toBe(false);
    });

    it('should normalize raw Gmail payload structure with base64 encoded parts', () => {
      const rawMsg = {
        id: 'raw_msg_789',
        threadId: 'raw_thread_012',
        labelIds: ['SENT'],
        payload: {
          mimeType: 'multipart/alternative',
          headers: [
            { name: 'Subject', value: 'API Updates' },
            { name: 'From', value: 'developer@mailsense.ai' },
            { name: 'To', value: 'clients@mailsense.ai' },
            { name: 'Date', value: 'Tue, 07 Jul 2026 12:00:00 GMT' },
          ],
          parts: [
            {
              mimeType: 'text/plain',
              body: {
                // Base64Url representation of "We updated our endpoints."
                data: 'V2UgdXBkYXRlZCBvdXIgZW5kcG9pbnRzLg==',
                size: 27,
              },
            },
          ],
        },
      };

      const normalized = normalizeEmail(rawMsg);
      expect(normalized.id).toBe('raw_msg_789');
      expect(normalized.subject).toBe('API Updates');
      expect(normalized.sender).toBe('developer@mailsense.ai');
      expect(normalized.recipients).toContain('clients@mailsense.ai');
      expect(normalized.body.trim()).toBe('We updated our endpoints.');
      expect(normalized.isRead).toBe(true); // 'UNREAD' label is missing
    });
  });

});

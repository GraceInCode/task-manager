const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({ sendMail: mockSendMail }))
}));

const sendEmail = require('../utils/email');

describe('Email Notification', () => {
    beforeEach(() => {
        mockSendMail.mockClear();
        mockSendMail.mockResolvedValue(true);
    });

    it('should send email with correct parameters', async () => {
        const to = 'test@example.com';
        const subject = 'Test Subject';
        const text = 'Test message';

        await sendEmail(to, subject, text);

        expect(mockSendMail).toHaveBeenCalledWith({
            from: process.env.EMAIL_PASS,
            to,
            subject,
            text
        });
    });

    it('should handle email sending errors', async () => {
        mockSendMail.mockRejectedValue(new Error('Send failed'));

        await expect(sendEmail('test@example.com', 'Subject', 'Text'))
            .rejects.toThrow('Send failed');
    });
});

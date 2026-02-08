// Vercel Serverless Function: send reply from dentist to contact form sender's email

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, replyText, subject, recipientName } = req.body;

    if (!to || !replyText || !replyText.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to (email), replyText'
      });
    }

    const GMAIL_USER = process.env.GMAIL_USER || '';
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({
        success: false,
        error: 'Email service not configured.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    const subj = subject && subject.trim() ? subject.trim() : 'Re: Delas Alas Dental Clinic - your message';
    const name = (recipientName && recipientName.trim()) ? recipientName.trim() : 'there';
    const body = replyText.trim().replace(/\n/g, '<br>');

    const mailOptions = {
      from: `"Delas Alas Dental Clinic" <${GMAIL_USER}>`,
      to: to.trim(),
      subject: subj,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Delas Alas Dental Clinic</h1>
          </div>
          <div style="background: #ffffff; padding: 24px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 16px;">Hello ${name},</p>
            <p style="color: #333; font-size: 16px;">Thank you for contacting us. Here is our reply:</p>
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #667eea;">
              ${body}
            </div>
            <p style="color: #666; font-size: 14px;">If you have any other questions, feel free to reach out again.</p>
            <p style="color: #333; font-size: 14px;">Best regards,<br>Delas Alas Dental Clinic</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Contact reply email sent:', info.messageId);

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Error sending contact reply:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send reply'
    });
  }
};

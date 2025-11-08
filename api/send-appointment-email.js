// Vercel Serverless Function to send appointment confirmation email using Nodemailer

const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Handle CORS
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
    const { email, patientName, serviceType, appointmentDate, appointmentTime, dentistName, notes } = req.body;

    if (!email || !patientName || !serviceType || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: email, patientName, serviceType, appointmentDate, appointmentTime' 
      });
    }

    // Get Gmail credentials from environment variables
    const GMAIL_USER = process.env.GMAIL_USER || '';
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.'
      });
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD
      }
    });

    // Format date and time for display
    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const [hours, minutes] = appointmentTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = (hour % 12) || 12;
    const formattedTime = `${displayHour}:${minutes} ${ampm}`;

    // Email content
    const mailOptions = {
      from: `"Delas Alas Dental Clinic" <${GMAIL_USER}>`,
      to: email,
      subject: `Appointment Confirmed - ${serviceType} on ${formattedDate}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🦷 Delas Alas Dental Clinic</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #28a745; margin-top: 0;">✅ Appointment Confirmed!</h2>
            <p style="color: #333; font-size: 16px;">Hello ${patientName},</p>
            <p style="color: #333; font-size: 16px;">Your appointment has been confirmed. Please see the details below:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600; width: 40%;">Service:</td>
                  <td style="padding: 8px 0; color: #333;">${serviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Date:</td>
                  <td style="padding: 8px 0; color: #333;">${formattedDate}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Time:</td>
                  <td style="padding: 8px 0; color: #333;">${formattedTime}</td>
                </tr>
                ${dentistName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; font-weight: 600;">Dentist:</td>
                  <td style="padding: 8px 0; color: #333;">${dentistName}</td>
                </tr>
                ` : ''}
              </table>
            </div>
            
            ${notes ? `
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-weight: 600;">📝 Special Instructions:</p>
              <p style="color: #856404; margin: 5px 0 0 0;">${notes}</p>
            </div>
            ` : ''}
            
            <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <p style="color: #155724; margin: 0; font-weight: 600;">📅 Important Reminders:</p>
              <ul style="color: #155724; margin: 10px 0 0 20px; padding: 0;">
                <li>Please arrive 10 minutes before your scheduled appointment time</li>
                <li>Bring a valid ID and your insurance card (if applicable)</li>
                <li>If you need to reschedule or cancel, please contact us at least 24 hours in advance</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              Thank you for choosing Delas Alas Dental Clinic!<br>
              We look forward to seeing you soon.
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Appointment confirmation email sent successfully:', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'Appointment confirmation email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending appointment confirmation email:', error);
    console.error('❌ Error stack:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to send email',
      details: error.stack || 'Unknown error'
    });
  }
};


// Vercel Serverless Function to send OTP email using Nodemailer
// This uses Node.js, so Nodemailer works perfectly!

const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

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
    const { email, name, otp } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Email is required' 
      });
    }

    // Use provided OTP or generate new one if not provided
    let otpCode;
    if (otp) {
      // Use the OTP that was already generated and stored
      otpCode = otp.toString();
      console.log('📧 Using provided OTP:', otpCode);
    } else {
      // Generate 6-digit OTP if not provided (for backward compatibility)
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      console.log('📧 Generated new OTP:', otpCode);
    }
    
    // OTP expires in 10 minutes
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xlubjwiumytdkxrzojdg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase credentials not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store OTP in Supabase (only if not already stored by the caller)
    // The OTP should already be stored by the frontend via store_otp_code RPC
    // So we don't need to store it again here, but we'll try to update if it exists
    // This is just a backup in case the frontend storage failed
    try {
      const { error: dbError } = await supabase
        .from('otps')
        .upsert([{
          email: email,
          otp: otpCode,
          expires_at: expiresAt,
          verified: false
        }], {
          onConflict: 'email'
        });
      
      if (dbError) {
        console.warn('⚠️ Could not store OTP in otps table (may already be in otp_codes):', dbError.message);
        // Don't fail if this errors - the OTP might already be stored via RPC
      }
    } catch (storageError) {
      console.warn('⚠️ OTP storage warning (may already be stored):', storageError.message);
    }

    // Note: OTP should already be stored via store_otp_code RPC from frontend
    // This is just a backup storage attempt

    // Get Gmail credentials from environment variables
    const GMAIL_USER = process.env.GMAIL_USER || '';
    const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      console.error('Gmail credentials not configured');
      return res.status(500).json({ 
        success: false,
        error: 'Email service not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.',
        message: 'OTP stored in database but email not sent. Check console for OTP code.'
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

    // Email content
    const mailOptions = {
      from: `"Delas Alas Dental Clinic" <${GMAIL_USER}>`,
      to: email,
      subject: 'Password Change Confirmation Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🦷 Delas Alas Dental Clinic</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #667eea; margin-top: 0;">Password Change Confirmation</h2>
            <p style="color: #333; font-size: 16px;">Hello ${name || 'User'},</p>
            <p style="color: #333; font-size: 16px;">You have requested to change your password. Please use the following confirmation code:</p>
            <div style="background: #f0f0f0; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <h1 style="color: #667eea; font-size: 48px; margin: 0; font-family: monospace; letter-spacing: 5px;">${otpCode}</h1>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">This code will expire in <strong>10 minutes</strong>.</p>
            <p style="color: #666; font-size: 14px;">If you did not request this password change, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">Thank you,<br>Delas Alas Dental Clinic</p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ OTP email sent successfully:', info.messageId);

    return res.status(200).json({ 
      success: true, 
      message: 'OTP email sent successfully',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to send email',
      details: error.stack || 'Unknown error',
      message: 'Please check Vercel logs for more details. Make sure the otps table exists and environment variables are set.'
    });
  }
};


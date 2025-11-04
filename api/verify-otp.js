// Vercel Serverless Function to verify OTP
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
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

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

    // Find the latest OTP for this email that hasn't been verified
    const { data, error } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('❌ OTP verification failed:', error);
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      // Mark as verified to prevent reuse
      await supabase
        .from('otps')
        .update({ verified: true })
        .eq('id', data.id);

      return res.status(400).json({
        success: false,
        error: 'OTP expired. Please request a new one.'
      });
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from('otps')
      .update({ verified: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('❌ Error updating OTP:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify OTP'
      });
    }

    console.log('✅ OTP verified successfully for:', email);

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Verification failed'
    });
  }
};


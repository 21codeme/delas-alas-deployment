// Vercel Serverless Function to reset password after OTP verification
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
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long'
      });
    }

    // Initialize Supabase client with service role key (for admin operations)
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xlubjwiumytdkxrzojdg.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

    if (!supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase credentials not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify OTP first
    const { data: otpData, error: otpError } = await supabase
      .from('otps')
      .select('*')
      .eq('email', email)
      .eq('otp', otp)
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (otpError || !otpData) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or unverified OTP. Please verify OTP first.'
      });
    }

    // Check if OTP expired
    const now = new Date();
    const expiresAt = new Date(otpData.expires_at);
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired. Please request a new one.'
      });
    }

    // Get user from auth.users table using admin API
    // Note: This requires service_role key
    let user;
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching users:', authError);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch user data',
          details: authError.message
        });
      }

      user = authUsers.users.find(u => u.email === email);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
    } catch (error) {
      console.error('Error in admin API:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to access user data',
        details: error.message
      });
    }

    // Update password using Supabase Admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update password',
        details: updateError.message
      });
    }

    // Delete verified OTP to prevent reuse
    await supabase
      .from('otps')
      .delete()
      .eq('id', otpData.id);

    console.log('✅ Password reset successfully for:', email);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Error resetting password:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Password reset failed'
    });
  }
};


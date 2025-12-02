// Vercel Serverless Function to reset password using OTP verification
// This function updates the user's password in Supabase auth after OTP verification

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
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = process.env.SUPABASE_URL || 'https://xlubjwiumytdkxrzojdg.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseServiceKey) {
      return res.status(500).json({
        success: false,
        error: 'Supabase credentials not configured'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Looking for user with email:', email);

    // Get user by email from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user information',
        details: authError.message
      });
    }

    console.log('📊 Total users found:', authUsers?.users?.length || 0);
    
    // Log first few user emails for debugging (without exposing full data)
    if (authUsers?.users && authUsers.users.length > 0) {
      const sampleEmails = authUsers.users.slice(0, 5).map(u => u.email);
      console.log('📧 Sample user emails:', sampleEmails);
    }

    const user = authUsers.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found in auth.users:', email);
      return res.status(404).json({
        success: false,
        error: 'User not found. Please make sure you are using the correct email address.',
        hint: 'User might not exist in auth.users table'
      });
    }
    
    console.log('✅ User found:', { id: user.id, email: user.email });

    // Update password using admin API
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update password',
        details: updateError.message
      });
    }

    console.log('✅ Password updated successfully for:', email);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({
      success: false,
      error: 'An error occurred while resetting password',
      details: error.message
    });
  }
};

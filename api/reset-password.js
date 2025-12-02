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

    // Try multiple methods to find the user
    let user = null;
    let userFound = false;

    // Method 1: Use listUsers and find by email
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers?.users) {
        console.log('📊 Total users found via listUsers:', authUsers.users.length);
        
        // Log first few user emails for debugging (without exposing full data)
        if (authUsers.users.length > 0) {
          const sampleEmails = authUsers.users.slice(0, 5).map(u => u.email);
          console.log('📧 Sample user emails:', sampleEmails);
        }

        user = authUsers.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          userFound = true;
          console.log('✅ User found via listUsers:', { id: user.id, email: user.email });
        } else {
          console.log('⚠️ User not found in listUsers, trying alternative method...');
        }
      } else if (authError) {
        console.warn('⚠️ Error with listUsers (may not have admin access):', authError.message);
      }
    } catch (listError) {
      console.warn('⚠️ listUsers failed:', listError.message);
    }

    // Method 2: Try to get user by email using getUserByEmail (if available)
    if (!userFound) {
      try {
        // Note: Supabase doesn't have a direct getUserByEmail in admin API
        // But we can try to sign in as the user temporarily to get their ID
        // However, this requires the password, which we don't have
        
        // Alternative: Check if user exists in public.users and get their auth ID
        const { data: publicUser, error: publicError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', email)
          .single();
        
        if (!publicError && publicUser) {
          console.log('✅ User found in public.users:', publicUser);
          // Try to get auth user by ID
          try {
            const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(publicUser.id);
            if (!getUserError && authUser?.user) {
              user = authUser.user;
              userFound = true;
              console.log('✅ User found via getUserById:', { id: user.id, email: user.email });
            }
          } catch (getUserError) {
            console.warn('⚠️ getUserById failed:', getUserError.message);
          }
        }
      } catch (altError) {
        console.warn('⚠️ Alternative lookup failed:', altError.message);
      }
    }
    
    if (!userFound || !user) {
      console.error('❌ User not found in auth.users:', email);
      console.error('❌ This might be because:');
      console.error('   1. User does not exist in auth.users table');
      console.error('   2. Service role key is not configured correctly');
      console.error('   3. User email case mismatch');
      
      return res.status(404).json({
        success: false,
        error: 'User not found. Please make sure you are using the correct email address.',
        hint: 'User might not exist in auth.users table. Please contact support or try registering again.',
        debug: {
          emailSearched: email,
          serviceRoleConfigured: !!supabaseServiceKey
        }
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

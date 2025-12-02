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
    let publicUserExists = false;

    // First, check if user exists in public.users
    try {
      const { data: publicUser, error: publicError } = await supabase
        .from('users')
        .select('id, email')
        .ilike('email', email) // Use ilike for case-insensitive search
        .maybeSingle();
      
      if (!publicError && publicUser) {
        publicUserExists = true;
        console.log('✅ User found in public.users:', { id: publicUser.id, email: publicUser.email });
        
        // Try to get auth user by ID from public.users
        try {
          const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(publicUser.id);
          if (!getUserError && authUser?.user) {
            user = authUser.user;
            userFound = true;
            console.log('✅ User found via getUserById from public.users:', { id: user.id, email: user.email });
          } else {
            console.error('❌ User exists in public.users but NOT in auth.users!');
            console.error('❌ getUserById error:', getUserError?.message || 'User not found');
            console.error('❌ This means the user was deleted from auth.users but remains in public.users');
          }
        } catch (getUserError) {
          console.error('❌ getUserById exception:', getUserError.message);
        }
      } else {
        console.log('⚠️ User not found in public.users');
        if (publicError) {
          console.error('❌ Error querying public.users:', publicError.message);
        }
      }
    } catch (publicError) {
      console.error('❌ Exception checking public.users:', publicError.message);
    }

    // Method 2: Use listUsers and find by email (if not found yet)
    if (!userFound) {
      try {
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (!authError && authUsers?.users) {
          console.log('📊 Total users found via listUsers:', authUsers.users.length);
          
          // Try exact match first
          user = authUsers.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
          
          if (user) {
            userFound = true;
            console.log('✅ User found via listUsers:', { id: user.id, email: user.email });
        } else {
          // Log all emails for debugging (first 10 only)
          const allEmails = authUsers.users.slice(0, 10).map(u => u.email).filter(Boolean);
          console.log('📧 Available user emails (first 10):', allEmails);
          console.log('⚠️ User not found in listUsers');
          
          // Check if email exists but with different case
          const emailLower = email.toLowerCase();
          const foundByCase = authUsers.users.find(u => u.email && u.email.toLowerCase() === emailLower);
          if (foundByCase) {
            console.log('✅ Found user with different case:', foundByCase.email);
            user = foundByCase;
            userFound = true;
          }
        }
        } else if (authError) {
          console.error('❌ Error with listUsers:', authError.message);
        }
      } catch (listError) {
        console.error('❌ listUsers failed:', listError.message);
      }
    }
    
    if (!userFound || !user) {
      console.error('❌ User not found in auth.users:', email);
      console.error('❌ Debug info:');
      console.error('   - Email searched:', email);
      console.error('   - Exists in public.users:', publicUserExists);
      console.error('   - Service role configured:', !!supabaseServiceKey);
      
      // Provide helpful error message
      let errorMessage = 'User not found in authentication system.';
      let hint = 'Please contact support or try registering again.';
      
      if (publicUserExists) {
        errorMessage = 'User account exists but authentication record is missing.';
        hint = 'Your account may have been partially deleted. Please contact support to restore your account.';
      }
      
      return res.status(404).json({
        success: false,
        error: errorMessage,
        hint: hint,
        debug: {
          emailSearched: email,
          existsInPublicUsers: publicUserExists,
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

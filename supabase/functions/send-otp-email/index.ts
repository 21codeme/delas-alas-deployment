// Supabase Edge Function to send OTP email
// This function sends OTP codes via email using Supabase's email service

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@delasalas.com'

serve(async (req) => {
  try {
    // Handle CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    const { email, otp, name } = await req.json()

    if (!email || !otp) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP are required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    // Send email using Resend (or Supabase's email service)
    // Note: You can also use Supabase's built-in email templates
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: email,
        subject: 'Password Change Confirmation Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #667eea;">Password Change Confirmation</h2>
            <p>Hello ${name || 'User'},</p>
            <p>You have requested to change your password. Please use the following confirmation code:</p>
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h1 style="color: #667eea; font-size: 32px; margin: 0; font-family: monospace;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this password change, please ignore this email.</p>
            <p>Thank you,<br>Delas Alas Dental Clinic</p>
          </div>
        `,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      console.error('Email sending failed:', errorData)
      
      // Fallback: Try using Supabase's auth email system
      // This is a workaround if Resend is not configured
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email',
          message: 'Email service not configured. Please configure Resend API key or use Supabase email templates.'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        }
      )
    }

    const emailData = await emailResponse.json()
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OTP email sent successfully',
        emailId: emailData.id 
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    )

  } catch (error) {
    console.error('Error in send-otp-email function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      }
    )
  }
})


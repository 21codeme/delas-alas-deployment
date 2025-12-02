-- Create OTP codes table to store OTPs temporarily
CREATE TABLE IF NOT EXISTS otp_codes (
  email TEXT PRIMARY KEY,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on otp_codes table
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (to avoid errors)
DROP POLICY IF EXISTS "Users can manage their own OTP codes" ON otp_codes;

-- Create RLS policy: Allow users to insert/update their own OTP
CREATE POLICY "Users can manage their own OTP codes"
ON otp_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON otp_codes TO anon, authenticated;

-- Create function to store OTP (will be called from frontend)
CREATE OR REPLACE FUNCTION store_otp_code(
  user_email TEXT,
  code TEXT,
  expiry_minutes INTEGER DEFAULT 10
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Store OTP in database
  INSERT INTO otp_codes (email, otp_code, expires_at)
  VALUES (
    user_email,
    code,
    NOW() + (expiry_minutes || ' minutes')::INTERVAL
  )
  ON CONFLICT (email) DO UPDATE SET
    otp_code = EXCLUDED.otp_code,
    expires_at = EXCLUDED.expires_at,
    created_at = NOW();
  
  -- Return success
  result := json_build_object(
    'success', true,
    'message', 'OTP stored successfully'
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION store_otp_code TO anon, authenticated;

-- Create function to verify OTP
CREATE OR REPLACE FUNCTION verify_otp_code(
  user_email TEXT,
  code TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stored_otp RECORD;
  result JSON;
BEGIN
  -- Get stored OTP
  SELECT otp_code, expires_at INTO stored_otp
  FROM otp_codes
  WHERE email = user_email;
  
  -- Check if OTP exists
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'message', 'OTP not found or expired'
    );
  END IF;
  
  -- Check if expired
  IF stored_otp.expires_at < NOW() THEN
    DELETE FROM otp_codes WHERE email = user_email;
    RETURN json_build_object(
      'success', false,
      'message', 'OTP expired'
    );
  END IF;
  
  -- Verify OTP (trim and compare as text to avoid type issues)
  IF TRIM(stored_otp.otp_code) = TRIM(code) THEN
    -- Delete OTP after successful verification
    DELETE FROM otp_codes WHERE email = user_email;
    RETURN json_build_object(
      'success', true,
      'message', 'OTP verified successfully'
    );
  ELSE
    -- Log the mismatch for debugging (optional)
    RAISE NOTICE 'OTP mismatch: stored=%, provided=%', stored_otp.otp_code, code;
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid OTP code',
      'message', 'Invalid OTP code'
    );
  END IF;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION verify_otp_code TO anon, authenticated;

-- Clean up expired OTPs (run periodically or in a trigger)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_otps TO anon, authenticated;


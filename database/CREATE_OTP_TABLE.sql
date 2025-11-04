-- Create OTP table for password reset
CREATE TABLE IF NOT EXISTS otps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  otp TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_otps_email ON otps(email);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_otps_expires_at ON otps(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE otps ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert OTPs (for password reset)
CREATE POLICY "Allow anonymous to insert OTPs" ON otps
  FOR INSERT
  WITH CHECK (true);

-- Allow anonymous users to select OTPs (for verification)
CREATE POLICY "Allow anonymous to select OTPs" ON otps
  FOR SELECT
  USING (true);

-- Allow anonymous users to update OTPs (to mark as verified)
CREATE POLICY "Allow anonymous to update OTPs" ON otps
  FOR UPDATE
  USING (true);

-- Grant permissions
GRANT INSERT, SELECT, UPDATE ON TABLE otps TO anon;
GRANT INSERT, SELECT, UPDATE ON TABLE otps TO authenticated;

-- Function to clean up expired OTPs (optional - can be called periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM otps WHERE expires_at < NOW();
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_otps TO anon, authenticated;


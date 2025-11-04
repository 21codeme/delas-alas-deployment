-- Create Notifications Table for Real-time Notifications
-- Run this in Supabase SQL Editor

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('appointment', 'message', 'schedule', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb, -- Store additional data like appointment details, message content, etc.
  is_read boolean DEFAULT false,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone -- Optional expiration date
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Allow system to create notifications for any user

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Function to automatically mark messages as read when notification is read
CREATE OR REPLACE FUNCTION public.mark_message_read_on_notification_read()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If this is a message notification being marked as read
  IF NEW.is_read = true AND OLD.is_read = false AND NEW.type = 'message' THEN
    -- Extract message_id from the notification data
    IF NEW.data IS NOT NULL AND NEW.data ? 'message_id' THEN
      -- Mark the actual message as read
      UPDATE public.messages 
      SET is_read = true, updated_at = now()
      WHERE id = (NEW.data->>'message_id')::uuid;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically mark messages as read
CREATE TRIGGER mark_message_read_trigger
  AFTER UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.mark_message_read_on_notification_read();

-- Function to create appointment notifications
CREATE OR REPLACE FUNCTION public.create_appointment_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dentist_user_id uuid;
  patient_user_id uuid;
BEGIN
  -- Get dentist and patient user IDs
  SELECT id INTO dentist_user_id FROM public.users WHERE user_type = 'dentist' LIMIT 1;
  patient_user_id := NEW.patient_id;
  
  -- Create notification for dentist
  IF dentist_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data, priority)
    VALUES (
      dentist_user_id,
      'appointment',
      'New Appointment Scheduled',
      NEW.patient_name || ' has scheduled an appointment for ' || NEW.service_type || ' on ' || NEW.appointment_date,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'patient_name', NEW.patient_name,
        'service_type', NEW.service_type,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time,
        'status', NEW.status
      ),
      CASE 
        WHEN NEW.appointment_date::date = CURRENT_DATE THEN 'high'
        WHEN NEW.appointment_date::date = CURRENT_DATE + INTERVAL '1 day' THEN 'normal'
        ELSE 'low'
      END
    );
  END IF;
  
  -- Create notification for patient
  IF patient_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, data, priority)
    VALUES (
      patient_user_id,
      'appointment',
      'Appointment Confirmed',
      'Your appointment for ' || NEW.service_type || ' has been scheduled for ' || NEW.appointment_date,
      jsonb_build_object(
        'appointment_id', NEW.id,
        'service_type', NEW.service_type,
        'appointment_date', NEW.appointment_date,
        'appointment_time', NEW.appointment_time,
        'status', NEW.status
      ),
      'normal'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create appointment notifications
CREATE TRIGGER create_appointment_notifications_trigger
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.create_appointment_notifications();

-- Function to create message notifications
CREATE OR REPLACE FUNCTION public.create_message_notifications()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sender_name text;
  receiver_name text;
BEGIN
  -- Get sender and receiver names
  SELECT name INTO sender_name FROM public.users WHERE id = NEW.sender_id;
  SELECT name INTO receiver_name FROM public.users WHERE id = NEW.receiver_id;
  
  -- Create notification for receiver
  INSERT INTO public.notifications (user_id, type, title, message, data, priority)
  VALUES (
    NEW.receiver_id,
    'message',
    'New Message from ' || COALESCE(sender_name, 'Unknown'),
    COALESCE(sender_name, 'Unknown') || ': ' || LEFT(NEW.content, 100),
    jsonb_build_object(
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'sender_name', sender_name,
      'content', NEW.content,
      'message_type', NEW.message_type
    ),
    'normal'
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create message notifications
CREATE TRIGGER create_message_notifications_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_message_notifications();

-- Function to create daily schedule notifications
CREATE OR REPLACE FUNCTION public.create_daily_schedule_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  dentist_user_id uuid;
  appointment_record record;
  notification_count integer := 0;
BEGIN
  -- Get dentist user ID
  SELECT id INTO dentist_user_id FROM public.users WHERE user_type = 'dentist' LIMIT 1;
  
  IF dentist_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Create notifications for today's appointments
  FOR appointment_record IN 
    SELECT a.*, u.name as patient_name
    FROM public.appointments a
    JOIN public.users u ON a.patient_id = u.id
    WHERE a.appointment_date::date = CURRENT_DATE
    AND a.status IN ('confirmed', 'pending')
  LOOP
    INSERT INTO public.notifications (user_id, type, title, message, data, priority, expires_at)
    VALUES (
      dentist_user_id,
      'schedule',
      'Appointment Today: ' || appointment_record.patient_name,
      appointment_record.patient_name || ' has an appointment for ' || appointment_record.service_type || ' at ' || appointment_record.appointment_time,
      jsonb_build_object(
        'appointment_id', appointment_record.id,
        'patient_name', appointment_record.patient_name,
        'service_type', appointment_record.service_type,
        'appointment_time', appointment_record.appointment_time,
        'status', appointment_record.status
      ),
      'high',
      CURRENT_DATE + INTERVAL '1 day' -- Expire tomorrow
    );
    
    notification_count := notification_count + 1;
  END LOOP;
  
  -- Create summary notification if there are appointments
  IF notification_count > 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, data, priority, expires_at)
    VALUES (
      dentist_user_id,
      'schedule',
      'Daily Schedule Summary',
      'You have ' || notification_count || ' appointment(s) scheduled for today',
      jsonb_build_object(
        'appointment_count', notification_count,
        'date', CURRENT_DATE
      ),
      'normal',
      CURRENT_DATE + INTERVAL '1 day'
    );
  END IF;
END;
$$;

-- Enable real-time for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to clean up old notifications (optional)
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete notifications older than 30 days
  DELETE FROM public.notifications 
  WHERE created_at < CURRENT_DATE - INTERVAL '30 days';
  
  -- Delete expired notifications
  DELETE FROM public.notifications 
  WHERE expires_at IS NOT NULL AND expires_at < now();
END;
$$;

-- Verify tables were created successfully
SELECT 'Notifications table created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';






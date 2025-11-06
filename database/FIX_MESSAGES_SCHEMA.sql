-- Fix Messages Table Schema and Create Conversations Table
-- Run this in Supabase SQL Editor

-- First, let's check what columns exist in the current messages table
-- (This is just for reference - you can run this to see the current structure)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public';

-- Drop the existing messages table and recreate it with the correct schema
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create the messages table with correct schema
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create conversations table to track conversation threads
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dentist_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at timestamp with time zone DEFAULT now(),
  last_message_content text,
  last_message_sender_id uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(patient_id, dentist_id)
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = receiver_id 
      AND user_type IN ('patient', 'dentist')
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() = dentist_id
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    (auth.uid() = patient_id AND EXISTS (
      SELECT 1 FROM public.users WHERE id = dentist_id AND user_type = 'dentist'
    )) OR
    (auth.uid() = dentist_id AND EXISTS (
      SELECT 1 FROM public.users WHERE id = patient_id AND user_type = 'patient'
    ))
  );

CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = patient_id OR auth.uid() = dentist_id
  );

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX idx_conversations_dentist_id ON public.conversations(dentist_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Function to update conversation when new message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or create conversation
  INSERT INTO public.conversations (patient_id, dentist_id, last_message_at, last_message_content, last_message_sender_id)
  VALUES (
    CASE WHEN (SELECT user_type FROM public.users WHERE id = NEW.sender_id) = 'patient' THEN NEW.sender_id ELSE NEW.receiver_id END,
    CASE WHEN (SELECT user_type FROM public.users WHERE id = NEW.sender_id) = 'dentist' THEN NEW.sender_id ELSE NEW.receiver_id END,
    NEW.created_at,
    NEW.content,
    NEW.sender_id
  )
  ON CONFLICT (patient_id, dentist_id)
  DO UPDATE SET
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    last_message_sender_id = NEW.sender_id,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update conversations
CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- Enable real-time for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Verify tables were created successfully
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages')
ORDER BY table_name;


-- Run this in Supabase SQL Editor

-- First, let's check what columns exist in the current messages table
-- (This is just for reference - you can run this to see the current structure)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'messages' AND table_schema = 'public';

-- Drop the existing messages table and recreate it with the correct schema
DROP TABLE IF EXISTS public.messages CASCADE;

-- Create the messages table with correct schema
CREATE TABLE public.messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create conversations table to track conversation threads
CREATE TABLE public.conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  dentist_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  last_message_at timestamp with time zone DEFAULT now(),
  last_message_content text,
  last_message_sender_id uuid REFERENCES public.users(id),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(patient_id, dentist_id)
);

-- Enable Row Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Messages policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND 
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = receiver_id 
      AND user_type IN ('patient', 'dentist')
    )
  );

CREATE POLICY "Users can update their own messages" ON public.messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON public.conversations
  FOR SELECT USING (
    auth.uid() = patient_id OR auth.uid() = dentist_id
  );

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (
    (auth.uid() = patient_id AND EXISTS (
      SELECT 1 FROM public.users WHERE id = dentist_id AND user_type = 'dentist'
    )) OR
    (auth.uid() = dentist_id AND EXISTS (
      SELECT 1 FROM public.users WHERE id = patient_id AND user_type = 'patient'
    ))
  );

CREATE POLICY "Users can update their own conversations" ON public.conversations
  FOR UPDATE USING (
    auth.uid() = patient_id OR auth.uid() = dentist_id
  );

-- Create indexes for better performance
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_conversation ON public.messages(sender_id, receiver_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE INDEX idx_conversations_patient_id ON public.conversations(patient_id);
CREATE INDEX idx_conversations_dentist_id ON public.conversations(dentist_id);
CREATE INDEX idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Function to update conversation when new message is sent
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update or create conversation
  INSERT INTO public.conversations (patient_id, dentist_id, last_message_at, last_message_content, last_message_sender_id)
  VALUES (
    CASE WHEN (SELECT user_type FROM public.users WHERE id = NEW.sender_id) = 'patient' THEN NEW.sender_id ELSE NEW.receiver_id END,
    CASE WHEN (SELECT user_type FROM public.users WHERE id = NEW.sender_id) = 'dentist' THEN NEW.sender_id ELSE NEW.receiver_id END,
    NEW.created_at,
    NEW.content,
    NEW.sender_id
  )
  ON CONFLICT (patient_id, dentist_id)
  DO UPDATE SET
    last_message_at = NEW.created_at,
    last_message_content = NEW.content,
    last_message_sender_id = NEW.sender_id,
    updated_at = now();
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update conversations
CREATE TRIGGER update_conversation_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_on_message();

-- Enable real-time for messages and conversations
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;

-- Verify tables were created successfully
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages')
ORDER BY table_name;


































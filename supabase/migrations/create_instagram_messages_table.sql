-- Instagram Messages Table Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/noyohqcyxokwefsrryzo/sql

-- Create the instagram_messages table to store synced DM messages
CREATE TABLE IF NOT EXISTS public.instagram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
    conversation_id TEXT NOT NULL,
    instagram_message_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    sender_username TEXT,
    is_from_page BOOLEAN NOT NULL DEFAULT false,
    message_text TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    -- Prevent duplicate messages
    CONSTRAINT instagram_messages_unique_msg UNIQUE (connection_id, instagram_message_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_instagram_messages_connection 
    ON public.instagram_messages(connection_id);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_conversation 
    ON public.instagram_messages(conversation_id);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_sent_at 
    ON public.instagram_messages(sent_at DESC);

-- Enable Row Level Security
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (needed for API operations)
CREATE POLICY "Service role full access to instagram_messages" 
    ON public.instagram_messages
    FOR ALL 
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

-- Grant permissions
GRANT ALL ON public.instagram_messages TO service_role;
GRANT SELECT ON public.instagram_messages TO authenticated;

-- Success message
SELECT 'instagram_messages table created successfully!' as result;

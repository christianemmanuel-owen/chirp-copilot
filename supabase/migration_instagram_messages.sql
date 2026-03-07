-- Instagram Messages Table for DM Mirroring
-- Run this migration in Supabase SQL editor

CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  connection_id uuid NOT NULL REFERENCES public.instagram_connections(id) ON DELETE CASCADE,
  conversation_id text NOT NULL,
  instagram_message_id text NOT NULL,
  sender_id text NOT NULL,
  sender_name text,
  sender_username text,
  is_from_page boolean NOT NULL DEFAULT false,
  message_text text,
  attachments jsonb NOT NULL DEFAULT '[]'::jsonb,
  sent_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT instagram_messages_unique_msg UNIQUE (connection_id, instagram_message_id)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS instagram_messages_conversation_idx 
  ON public.instagram_messages (connection_id, conversation_id);
CREATE INDEX IF NOT EXISTS instagram_messages_sent_at_idx 
  ON public.instagram_messages (sent_at DESC);
CREATE INDEX IF NOT EXISTS instagram_messages_sender_idx 
  ON public.instagram_messages (sender_id);

-- Enable RLS
ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

-- Service role full access policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'instagram_messages' 
    AND policyname = 'Allow service role full access instagram messages'
  ) THEN
    CREATE POLICY "Allow service role full access instagram messages"
      ON public.instagram_messages
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

-- Trigger for updated_at (if we add this column later)
-- Currently using created_at only since messages are immutable

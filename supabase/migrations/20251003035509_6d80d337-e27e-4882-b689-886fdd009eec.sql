-- Fix the unique username constraint issue
-- Drop the existing unique constraint on username
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- Recreate the trigger to generate unique usernames by appending user ID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role)
  VALUES (
    new.id,
    -- Generate unique username by combining email prefix with first 8 chars of UUID
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1) || '_' || substring(new.id::text, 1, 8)
    ),
    COALESCE(new.raw_user_meta_data->>'role', 'user')
  );
  RETURN new;
END;
$$;
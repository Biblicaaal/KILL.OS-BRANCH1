/*
  # Create app_state table for KILL.OS persistence

  1. New Tables
    - `app_state`
      - `id` (uuid, primary key) - Single-row table, fixed ID
      - `data` (jsonb) - Full application state blob
      - `updated_at` (timestamptz) - Last save timestamp

  2. Security
    - Enable RLS on `app_state` table
    - Add policy for anon users to read/write (app is local-only, no auth)

  3. Important Notes
    - This table stores the entire app state as a JSON blob
    - Uses upsert pattern: single row with fixed UUID
    - No user auth required - the app runs locally and saves anonymously
*/

CREATE TABLE IF NOT EXISTS app_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read access"
  ON app_state FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon insert access"
  ON app_state FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon update access"
  ON app_state FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create index on updated_at for quick last-save lookups
CREATE INDEX IF NOT EXISTS idx_app_state_updated_at ON app_state (updated_at DESC);

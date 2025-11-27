import '@testing-library/jest-dom';

// Provide default Supabase environment variables for tests so the client can initialize.
process.env.REACT_APP_SUPABASE_URL =
  process.env.REACT_APP_SUPABASE_URL || 'http://localhost:54321';
process.env.REACT_APP_SUPABASE_ANON_KEY =
  process.env.REACT_APP_SUPABASE_ANON_KEY || 'test-anon-key';


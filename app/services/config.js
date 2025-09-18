export const MONGODB_URL = process.env.MONGODB_URL;
export const EMAIL_USER = process.env.EMAIL_USER;
export const EMAIL_PASS = process.env.EMAIL_PASS;

// Add validation
if (!MONGODB_URL) {
  console.error('MONGODB_URL environment variable is not set');
  throw new Error('Missing MONGODB_URL environment variable');
}
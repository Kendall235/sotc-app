// Base62 alphabet for short, URL-safe IDs
// Full alphanumeric set: 0-9, a-z, A-Z (62 characters)
// 62^5 = 916,132,832 combinations - plenty for 100k+ cards
const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ID_LENGTH = 5;

/**
 * Generate a cryptographically random 5-character ID
 * Using Web Crypto API for secure randomness
 */
export function generateCardId(): string {
  let id = '';
  const randomBytes = crypto.getRandomValues(new Uint8Array(ID_LENGTH));
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET[randomBytes[i] % ALPHABET.length];
  }
  return id;
}

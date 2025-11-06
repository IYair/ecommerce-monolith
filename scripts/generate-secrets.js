#!/usr/bin/env node

/**
 * Generate secure random secrets for Strapi configuration
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║  🔐 Strapi Secrets Generator                              ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Generate a random secret (32 bytes in base64)
function generateSecret() {
  return crypto.randomBytes(32).toString('base64');
}

// Generate 4 app keys
function generateAppKeys() {
  return [1, 2, 3, 4].map(() => crypto.randomBytes(16).toString('base64')).join(',');
}

// Generate all secrets
const secrets = {
  STRAPI_ADMIN_JWT_SECRET: generateSecret(),
  STRAPI_API_TOKEN_SALT: generateSecret(),
  STRAPI_JWT_SECRET: generateSecret(),
  STRAPI_TRANSFER_TOKEN_SALT: generateSecret(),
  STRAPI_APP_KEYS: generateAppKeys(),
};

console.log('📋 Copy these values to your Dokploy environment variables:\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}\n`);
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📝 How to use in Dokploy:\n');
console.log('1. Go to your Dokploy app → Settings → Environment Variables');
console.log('2. Add each variable above (name and value)');
console.log('3. Save and redeploy your application\n');

console.log('⚠️  Security Tips:\n');
console.log('- NEVER commit these secrets to git');
console.log('- Store them securely (password manager, secrets vault)');
console.log('- Regenerate if compromised');
console.log('- Use different secrets for dev/staging/production\n');

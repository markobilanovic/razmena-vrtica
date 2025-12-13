// Environment loader for different environments
const { config } = require('dotenv');
const path = require('path');

const env = process.env.NODE_ENV || 'development';

// Load environment-specific file
const envFile = `.env.${env}`;
const envPath = path.resolve(__dirname, envFile);

console.log(`Loading environment: ${env}`);
console.log(`Environment file: ${envPath}`);

// Load the environment file
const result = config({ path: envPath });

if (result.error) {
  console.warn(`Warning: Could not load ${envFile}, falling back to .env`);
  // Fallback to default .env
  config();
} else {
  console.log(`Successfully loaded ${envFile}`);
}

module.exports = { env };
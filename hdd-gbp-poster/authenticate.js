/**
 * HDD GBP Poster - Authentication Script
 * 
 * Run this first to authenticate with Google and get a refresh token.
 * This will open a browser window for you to sign in with the Google account
 * that manages the Hickory Dickory Decks Business Profiles.
 * 
 * Usage: npm run auth
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// Scopes required for Google Business Profile
const SCOPES = [
  'https://www.googleapis.com/auth/business.manage'
];

async function authenticate() {
  // Load credentials
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Error: credentials.json not found!');
    console.error('Please download it from Google Cloud Console.');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web;

  // Create OAuth2 client
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3000/callback'
  );

  // Check if we already have a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    oAuth2Client.setCredentials(token);
    console.log('✓ Already authenticated. Token found at:', TOKEN_PATH);
    console.log('  To re-authenticate, delete token.json and run this again.');
    return;
  }

  // Generate auth URL
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'  // Force consent to get refresh token
  });

  console.log('Opening browser for authentication...');
  console.log('If it doesn\'t open automatically, go to:');
  console.log(authUrl);
  console.log('');

  // Create a local server to receive the callback
  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://localhost:3000');
        
        if (url.pathname === '/callback') {
          const code = url.searchParams.get('code');
          
          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<h1>Authentication Successful!</h1><p>You can close this window.</p>');
            
            // Exchange code for tokens
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            
            // Save tokens
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
            console.log('✓ Authentication successful!');
            console.log('  Token saved to:', TOKEN_PATH);
            console.log('');
            console.log('You can now use: npm run list  - to list your accounts');
            console.log('                 npm run post  - to post updates');
            
            server.close();
            resolve();
          } else {
            res.writeHead(400, { 'Content-Type': 'text/html' });
            res.end('<h1>Error</h1><p>No authorization code received.</p>');
          }
        }
      } catch (error) {
        console.error('Error during authentication:', error);
        res.writeHead(500, { 'Content-Type': 'text/html' });
        res.end('<h1>Error</h1><p>' + error.message + '</p>');
        server.close();
        reject(error);
      }
    });

    server.listen(3000, async () => {
      console.log('Listening for callback on http://localhost:3000/callback');
      // Dynamic import for ESM-only 'open' package
      const open = (await import('open')).default;
      open(authUrl);
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      console.log('\nAuthentication timed out. Please try again.');
      server.close();
      reject(new Error('Timeout'));
    }, 5 * 60 * 1000);
  });
}

authenticate().catch(console.error);

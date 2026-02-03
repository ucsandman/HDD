/**
 * HDD GBP Poster - List Accounts Script
 * 
 * Lists all Google Business Profile accounts and locations
 * associated with the authenticated Google account.
 * 
 * Usage: npm run list
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

async function getAuthClient() {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    console.error('Error: credentials.json not found!');
    process.exit(1);
  }

  if (!fs.existsSync(TOKEN_PATH)) {
    console.error('Error: Not authenticated. Please run: npm run auth');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
  const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
  const { client_id, client_secret } = credentials.installed || credentials.web;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'http://localhost:3000/callback'
  );
  oAuth2Client.setCredentials(token);

  return oAuth2Client;
}

async function listAccounts() {
  const auth = await getAuthClient();
  
  // My Business Account Management API
  const mybusinessaccountmanagement = google.mybusinessaccountmanagement({ version: 'v1', auth });
  
  // My Business Business Information API
  const mybusinessbusinessinformation = google.mybusinessbusinessinformation({ version: 'v1', auth });

  console.log('Fetching accounts...\n');

  try {
    // List all accounts
    const accountsResponse = await mybusinessaccountmanagement.accounts.list();
    const accounts = accountsResponse.data.accounts || [];

    if (accounts.length === 0) {
      console.log('No Business Profile accounts found for this Google account.');
      console.log('\nMake sure you\'re signed in with the account that manages');
      console.log('the Honest Day\'s Driving Business Profiles.');
      return;
    }

    console.log('='.repeat(60));
    console.log('GOOGLE BUSINESS PROFILE ACCOUNTS');
    console.log('='.repeat(60));

    for (const account of accounts) {
      console.log(`\nAccount: ${account.accountName || 'Unnamed'}`);
      console.log(`  ID: ${account.name}`);
      console.log(`  Type: ${account.type}`);
      console.log(`  Role: ${account.role}`);

      // List locations for this account
      try {
        const locationsResponse = await mybusinessbusinessinformation.accounts.locations.list({
          parent: account.name,
          readMask: 'name,title,storefrontAddress,websiteUri'
        });
        
        const locations = locationsResponse.data.locations || [];

        if (locations.length > 0) {
          console.log('\n  Locations:');
          for (const location of locations) {
            console.log(`\n    📍 ${location.title}`);
            console.log(`       ID: ${location.name}`);
            if (location.storefrontAddress) {
              const addr = location.storefrontAddress;
              const addressParts = [
                addr.addressLines?.join(', '),
                addr.locality,
                addr.administrativeArea,
                addr.postalCode
              ].filter(Boolean);
              console.log(`       Address: ${addressParts.join(', ')}`);
            }
            if (location.websiteUri) {
              console.log(`       Website: ${location.websiteUri}`);
            }
          }
        } else {
          console.log('\n  No locations found for this account.');
        }
      } catch (error) {
        console.log(`\n  Error fetching locations: ${error.message}`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('Use the Location IDs above in your posts.');
    console.log('='.repeat(60));

  } catch (error) {
    if (error.code === 401) {
      console.error('Authentication error. Please re-authenticate:');
      console.error('  1. Delete token.json');
      console.error('  2. Run: npm run auth');
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

listAccounts().catch(console.error);

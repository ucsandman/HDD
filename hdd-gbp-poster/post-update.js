/**
 * HDD GBP Poster - Post Update Script
 * 
 * Posts updates to Google Business Profiles for Honest Day's Driving locations.
 * 
 * Usage: npm run post
 * 
 * Configuration:
 *   Edit the LOCATIONS array below with your actual location IDs
 *   (get them from: npm run list)
 */

const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKEN_PATH = path.join(__dirname, 'token.json');

// ============================================================================
// CONFIGURATION - Edit these with your actual location IDs
// ============================================================================

// Add your location IDs here after running: npm run list
// Format: accounts/{account_id}/locations/{location_id}
const LOCATIONS = [
  // Example: 'accounts/123456789/locations/987654321',
  // Add all HDD locations here
];

// ============================================================================
// POST CONTENT - Edit this for each update
// ============================================================================

const POST_CONTENT = {
  // Post text (required)
  summary: `🚛 Hiring CDL drivers now!

Honest Day's Driving is looking for experienced CDL drivers. We offer:
✅ Competitive pay
✅ Great benefits
✅ Flexible schedules
✅ Family-friendly company culture

Apply today at honestdaysdriving.com/careers`,

  // Call to action (optional)
  // Supported types: BOOK, ORDER, SHOP, LEARN_MORE, SIGN_UP, CALL
  callToAction: {
    actionType: 'LEARN_MORE',
    url: 'https://honestdaysdriving.com/careers'
  },

  // Optional: Schedule for future (ISO 8601 format)
  // event: {
  //   title: 'Hiring Event',
  //   schedule: {
  //     startDate: { year: 2026, month: 2, day: 15 },
  //     startTime: { hours: 9, minutes: 0 },
  //     endDate: { year: 2026, month: 2, day: 15 },
  //     endTime: { hours: 17, minutes: 0 }
  //   }
  // }
};

// ============================================================================
// SCRIPT LOGIC - Don't edit below unless you know what you're doing
// ============================================================================

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

  // Check if token needs refresh
  if (token.expiry_date && token.expiry_date < Date.now()) {
    console.log('Refreshing access token...');
    const { credentials: newToken } = await oAuth2Client.refreshAccessToken();
    oAuth2Client.setCredentials(newToken);
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(newToken, null, 2));
  }

  return oAuth2Client;
}

async function postUpdate() {
  if (LOCATIONS.length === 0) {
    console.error('Error: No locations configured!');
    console.error('');
    console.error('Please edit post-update.js and add your location IDs to the LOCATIONS array.');
    console.error('You can get your location IDs by running: npm run list');
    process.exit(1);
  }

  const auth = await getAuthClient();
  
  // Note: The Business Profile API uses mybusiness.v4 for posts
  // but that's being deprecated. Using direct REST API calls instead.
  
  console.log('Posting update to', LOCATIONS.length, 'location(s)...\n');
  console.log('Post content:');
  console.log('-'.repeat(50));
  console.log(POST_CONTENT.summary);
  console.log('-'.repeat(50));
  console.log('');

  const results = [];

  for (const locationId of LOCATIONS) {
    console.log(`Posting to: ${locationId}`);
    
    try {
      // Build the post data
      const postData = {
        languageCode: 'en-US',
        summary: POST_CONTENT.summary,
        topicType: 'STANDARD'
      };

      if (POST_CONTENT.callToAction) {
        postData.callToAction = POST_CONTENT.callToAction;
      }

      if (POST_CONTENT.event) {
        postData.event = POST_CONTENT.event;
        postData.topicType = 'EVENT';
      }

      // Make the API call using googleapis
      // Note: As of 2024, the localPosts endpoint is part of mybusiness v4
      // which requires direct fetch since googleapis may not have full support
      
      const accessToken = (await auth.getAccessToken()).token;
      
      const response = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(postData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`  ✓ Posted successfully! Post ID: ${result.name}`);
      results.push({ location: locationId, success: true, postId: result.name });

    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      results.push({ location: locationId, success: false, error: error.message });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY');
  console.log('='.repeat(50));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Posted successfully: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\nFailed locations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.location}: ${r.error}`);
    });
  }
}

postUpdate().catch(console.error);

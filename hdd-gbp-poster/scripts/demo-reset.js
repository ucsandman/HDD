#!/usr/bin/env node

/**
 * Demo Mode Reset Script
 *
 * This script resets the demo database to a fresh state by:
 * - Deleting the SQLite database file
 * - Recreating the schema
 * - Re-seeding the demo data
 *
 * Usage: npm run demo:reset
 *
 * Security note: All commands are hardcoded (no user input) and are safe.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT_DIR = path.join(__dirname, '..')
const DEMO_DB_FILE = path.join(ROOT_DIR, 'prisma', 'demo.db')
const DEMO_DB_JOURNAL = path.join(ROOT_DIR, 'prisma', 'demo.db-journal')
const DEMO_UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'demo-uploads')
const ENV_FILE = path.join(ROOT_DIR, '.env')

function log(message) {
  console.log(`[demo-reset] ${message}`)
}

function error(message) {
  console.error(`[demo-reset] ERROR: ${message}`)
}

function run(command) {
  // Security: all commands are hardcoded strings, not user input
  log(`Running: ${command}`)
  try {
    execSync(command, {
      cwd: ROOT_DIR,
      stdio: 'inherit',
    })
  } catch (err) {
    error(`Command failed: ${command}`)
    process.exit(1)
  }
}

async function main() {
  log('Resetting demo mode...')
  log('')

  // Check if in demo mode
  if (fs.existsSync(ENV_FILE)) {
    const envContent = fs.readFileSync(ENV_FILE, 'utf-8')
    if (!envContent.includes('DEMO_MODE=true')) {
      error('Not in demo mode! Run "npm run demo" first.')
      process.exit(1)
    }
  } else {
    error('.env file not found! Run "npm run demo" first.')
    process.exit(1)
  }

  // Step 1: Delete SQLite database
  if (fs.existsSync(DEMO_DB_FILE)) {
    log('Deleting demo database...')
    fs.unlinkSync(DEMO_DB_FILE)
  }

  if (fs.existsSync(DEMO_DB_JOURNAL)) {
    fs.unlinkSync(DEMO_DB_JOURNAL)
  }

  // Step 2: Delete uploaded demo images
  if (fs.existsSync(DEMO_UPLOADS_DIR)) {
    log('Clearing demo uploads...')
    const files = fs.readdirSync(DEMO_UPLOADS_DIR)
    for (const file of files) {
      if (file !== '.gitkeep') {
        fs.unlinkSync(path.join(DEMO_UPLOADS_DIR, file))
      }
    }
  }

  // Step 3: Push schema to create new database
  log('')
  log('Recreating SQLite database...')
  run('npx prisma db push --skip-generate')

  // Step 4: Re-run demo seed
  log('')
  log('Seeding demo data...')
  run('npx tsx prisma/seed-demo.ts')

  // Done!
  log('')
  log('========================================')
  log('Demo data reset complete!')
  log('========================================')
  log('')
  log('Run "npm run dev" to start the server.')
  log('')
}

main().catch((err) => {
  error(err.message)
  process.exit(1)
})

#!/usr/bin/env node

/**
 * Demo Mode Setup Script
 *
 * This script sets up the GBP Post Scheduler in demo mode with:
 * - SQLite database (no external services required)
 * - Sample data for all features
 * - Bypassed authentication
 *
 * Usage: npm run demo
 *
 * Security note: All commands are hardcoded (no user input) and are safe.
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const ROOT_DIR = path.join(__dirname, '..')
const ENV_FILE = path.join(ROOT_DIR, '.env')
const ENV_DEMO_FILE = path.join(ROOT_DIR, '.env.demo')
const ENV_BACKUP_FILE = path.join(ROOT_DIR, '.env.backup')
const SCHEMA_FILE = path.join(ROOT_DIR, 'prisma', 'schema.prisma')
const SCHEMA_DEMO_FILE = path.join(ROOT_DIR, 'prisma', 'schema.demo.prisma')
const SCHEMA_BACKUP_FILE = path.join(ROOT_DIR, 'prisma', 'schema.prisma.backup')
const DEMO_UPLOADS_DIR = path.join(ROOT_DIR, 'public', 'demo-uploads')

function log(message) {
  console.log(`[demo] ${message}`)
}

function error(message) {
  console.error(`[demo] ERROR: ${message}`)
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
  log('Setting up demo mode...')
  log('')

  // Step 1: Check if .env exists and warn
  if (fs.existsSync(ENV_FILE)) {
    const existingEnv = fs.readFileSync(ENV_FILE, 'utf-8')
    if (!existingEnv.includes('DEMO_MODE=true')) {
      log('Existing .env file found. Creating backup at .env.backup')
      fs.copyFileSync(ENV_FILE, ENV_BACKUP_FILE)
    }
  }

  // Step 2: Copy .env.demo to .env
  if (!fs.existsSync(ENV_DEMO_FILE)) {
    error('.env.demo file not found! Please ensure it exists.')
    process.exit(1)
  }
  log('Copying .env.demo to .env')
  fs.copyFileSync(ENV_DEMO_FILE, ENV_FILE)

  // Step 3: Backup and swap Prisma schema
  if (fs.existsSync(SCHEMA_FILE)) {
    const currentSchema = fs.readFileSync(SCHEMA_FILE, 'utf-8')
    if (!currentSchema.includes('provider = "sqlite"')) {
      log('Backing up production schema to schema.prisma.backup')
      fs.copyFileSync(SCHEMA_FILE, SCHEMA_BACKUP_FILE)
    }
  }

  if (!fs.existsSync(SCHEMA_DEMO_FILE)) {
    error('schema.demo.prisma not found! Please ensure it exists.')
    process.exit(1)
  }
  log('Copying schema.demo.prisma to schema.prisma')
  fs.copyFileSync(SCHEMA_DEMO_FILE, SCHEMA_FILE)

  // Step 4: Generate Prisma client
  log('')
  log('Generating Prisma client for SQLite...')
  run('npx prisma generate')

  // Step 5: Push schema to SQLite database
  log('')
  log('Creating SQLite database...')
  run('npx prisma db push --skip-generate')

  // Step 6: Run demo seed
  log('')
  log('Seeding demo data...')
  run('npx tsx prisma/seed-demo.ts')

  // Step 7: Create demo-uploads directory
  if (!fs.existsSync(DEMO_UPLOADS_DIR)) {
    log('Creating public/demo-uploads directory')
    fs.mkdirSync(DEMO_UPLOADS_DIR, { recursive: true })
  }

  // Step 8: Add .gitignore entries for demo files
  const gitignorePath = path.join(ROOT_DIR, '.gitignore')
  if (fs.existsSync(gitignorePath)) {
    let gitignore = fs.readFileSync(gitignorePath, 'utf-8')
    const demoEntries = [
      '# Demo mode files',
      'prisma/demo.db',
      'prisma/demo.db-journal',
      'prisma/schema.prisma.backup',
      '.env.backup',
      'public/demo-uploads/',
    ]

    const missingEntries = demoEntries.filter(entry => !gitignore.includes(entry))
    if (missingEntries.length > 0) {
      log('Adding demo files to .gitignore')
      gitignore += '\n' + missingEntries.join('\n') + '\n'
      fs.writeFileSync(gitignorePath, gitignore)
    }
  }

  // Done!
  log('')
  log('========================================')
  log('Demo mode setup complete!')
  log('========================================')
  log('')
  log('Starting development server...')
  log('')
  log('Open http://localhost:3000 in your browser')
  log('')
  log('Features:')
  log('  - No login required (auto-authenticated as demo user)')
  log('  - Sample posts, images, and data pre-loaded')
  log('  - AI generation works with sample content')
  log('  - Publishing simulated (no real Google API calls)')
  log('')
  log('To reset demo data: npm run demo:reset')
  log('To restore production mode: restore .env.backup and schema.prisma.backup')
  log('')

  // Start dev server
  run('npm run dev')
}

main().catch((err) => {
  error(err.message)
  process.exit(1)
})

#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Pterodactyl Panel Serverless Architecture...\n');

// Check if wrangler is installed
try {
  execSync('wrangler --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Wrangler CLI not found. Installing...');
  execSync('npm install -g wrangler', { stdio: 'inherit' });
  console.log('✅ Wrangler CLI installed\n');
}

// Check authentication
try {
  execSync('wrangler whoami', { stdio: 'ignore' });
  console.log('✅ Wrangler authentication verified\n');
} catch (error) {
  console.log('⚠️  Please authenticate with Cloudflare:');
  console.log('   Run: wrangler login\n');
  process.exit(1);
}

// Create D1 database
console.log('📦 Creating D1 database...');
try {
  const dbResult = execSync('wrangler d1 create pterodactyl_panel', { encoding: 'utf8' });
  console.log('✅ D1 database created');
  
  // Extract database ID from output
  const dbIdMatch = dbResult.match(/database_id = "([^"]+)"/);
  if (dbIdMatch) {
    const databaseId = dbIdMatch[1];
    
    // Update wrangler.toml with the database ID
    let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    wranglerConfig = wranglerConfig.replace('database_id = "your-database-id"', `database_id = "${databaseId}"`);
    fs.writeFileSync('wrangler.toml', wranglerConfig);
    console.log('✅ Database ID updated in wrangler.toml');
  }
} catch (error) {
  console.log('⚠️  D1 database might already exist or creation failed');
}

// Create KV namespace
console.log('🗄️  Creating KV namespace...');
try {
  const kvResult = execSync('wrangler kv:namespace create "CACHE"', { encoding: 'utf8' });
  console.log('✅ KV namespace created');
  
  // Extract KV ID from output
  const kvIdMatch = kvResult.match(/id = "([^"]+)"/);
  if (kvIdMatch) {
    const kvId = kvIdMatch[1];
    
    // Update wrangler.toml with the KV ID
    let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    wranglerConfig = wranglerConfig.replace('id = "your-kv-namespace-id"', `id = "${kvId}"`);
    fs.writeFileSync('wrangler.toml', wranglerConfig);
    console.log('✅ KV namespace ID updated in wrangler.toml');
  }
} catch (error) {
  console.log('⚠️  KV namespace might already exist or creation failed');
}

// Create KV preview namespace
try {
  const kvPreviewResult = execSync('wrangler kv:namespace create "CACHE" --preview', { encoding: 'utf8' });
  const kvPreviewIdMatch = kvPreviewResult.match(/id = "([^"]+)"/);
  if (kvPreviewIdMatch) {
    const kvPreviewId = kvPreviewIdMatch[1];
    
    // Update wrangler.toml with the KV preview ID
    let wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
    wranglerConfig = wranglerConfig.replace('preview_id = "your-kv-preview-id"', `preview_id = "${kvPreviewId}"`);
    fs.writeFileSync('wrangler.toml', wranglerConfig);
    console.log('✅ KV preview namespace ID updated in wrangler.toml');
  }
} catch (error) {
  console.log('⚠️  KV preview namespace creation failed');
}

// Create R2 bucket
console.log('🪣 Creating R2 bucket...');
try {
  execSync('wrangler r2 bucket create pterodactyl-storage', { stdio: 'ignore' });
  console.log('✅ R2 bucket created');
} catch (error) {
  console.log('⚠️  R2 bucket might already exist or creation failed');
}

// Generate database migrations
console.log('🗃️  Generating database migrations...');
try {
  execSync('npm run db:generate', { stdio: 'inherit' });
  console.log('✅ Database migrations generated');
} catch (error) {
  console.log('⚠️  Database migration generation failed');
}

// Apply database migrations
console.log('📋 Applying database migrations...');
try {
  execSync('npm run db:migrate', { stdio: 'inherit' });
  console.log('✅ Database migrations applied');
} catch (error) {
  console.log('⚠️  Database migration failed - you may need to run this manually');
}

// Set secrets
console.log('🔐 Setting up secrets...');
const secrets = [
  { name: 'JWT_SECRET', value: require('crypto').randomBytes(32).toString('hex') },
];

secrets.forEach(secret => {
  try {
    execSync(`wrangler secret put ${secret.name}`, { 
      input: secret.value,
      stdio: ['pipe', 'inherit', 'inherit'] 
    });
    console.log(`✅ Secret ${secret.name} set`);
  } catch (error) {
    console.log(`⚠️  Failed to set secret ${secret.name}`);
  }
});

console.log('\n🎉 Setup complete!');
console.log('\nNext steps:');
console.log('1. Update wrangler.toml with your specific configuration');
console.log('2. Run "npm run worker:dev" to start development');
console.log('3. Run "npm run worker:deploy" to deploy to production');
console.log('\n📚 Documentation: https://pterodactyl.io/panel/2.0/');
console.log('💬 Support: https://discord.gg/pterodactyl');
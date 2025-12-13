#!/usr/bin/env node

/**
 * Supabase Deployment Helper
 * 
 * This script helps deploy schema changes to Supabase by:
 * 1. Generating the complete schema
 * 2. Providing deployment instructions
 * 3. Creating backup recommendations
 * 
 * Usage:
 * npm run deploy-supabase
 */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function deployToSupabase() {
  console.log('🚀 Supabase Deployment Helper');
  console.log('================================');
  console.log('');

  try {
    // Create schemas directory if it doesn't exist
    const schemasDir = join(process.cwd(), 'schemas');
    try {
      execSync(`mkdir -p ${schemasDir}`);
    } catch (error) {
      // Directory might already exist
    }

    // Generate the complete schema
    console.log('📝 Generating Supabase schema...');
    const schemaOutput = execSync('npm run generate-supabase-schema', { 
      encoding: 'utf8',
      cwd: process.cwd()
    });

    // Write to file
    const schemaPath = join(schemasDir, 'supabase-complete.sql');
    writeFileSync(schemaPath, schemaOutput);
    
    console.log(`✅ Schema generated: ${schemaPath}`);
    console.log('');

    // Provide deployment instructions
    console.log('📋 DEPLOYMENT INSTRUCTIONS');
    console.log('==========================');
    console.log('');
    console.log('1. 🔍 REVIEW THE SCHEMA:');
    console.log(`   Open and review: ${schemaPath}`);
    console.log('   - Check all tables and columns');
    console.log('   - Verify RLS policies');
    console.log('   - Ensure indexes are appropriate');
    console.log('');

    console.log('2. 💾 BACKUP EXISTING DATA:');
    console.log('   - Go to Supabase Dashboard > Settings > Database');
    console.log('   - Create a backup before applying changes');
    console.log('   - Or use: pg_dump to create local backup');
    console.log('');

    console.log('3. 🎯 APPLY TO SUPABASE:');
    console.log('   - Go to Supabase Dashboard > SQL Editor');
    console.log('   - Copy and paste the schema content');
    console.log('   - Run in sections if needed (enums first, then tables, then policies)');
    console.log('   - Test each section before proceeding');
    console.log('');

    console.log('4. ✅ VERIFY DEPLOYMENT:');
    console.log('   - Check all tables exist: \\dt in SQL editor');
    console.log('   - Test RLS policies with sample queries');
    console.log('   - Run your application tests');
    console.log('   - Verify API endpoints work correctly');
    console.log('');

    console.log('5. 🔄 UPDATE LOCAL ENVIRONMENT:');
    console.log('   - Update your .env files with new Supabase details');
    console.log('   - Test local development against Supabase');
    console.log('   - Update documentation if needed');
    console.log('');

    console.log('⚠️  IMPORTANT NOTES:');
    console.log('   - Always test on a staging environment first');
    console.log('   - Have a rollback plan ready');
    console.log('   - Monitor application after deployment');
    console.log('   - Keep this schema file in version control');
    console.log('');

    console.log('🔗 USEFUL SUPABASE COMMANDS:');
    console.log('   -- List all tables:');
    console.log('   \\dt');
    console.log('');
    console.log('   -- Check RLS status:');
    console.log('   SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname = \'public\';');
    console.log('');
    console.log('   -- List policies:');
    console.log('   SELECT * FROM pg_policies WHERE schemaname = \'public\';');
    console.log('');

    console.log('✨ Ready for deployment!');
    console.log(`📁 Schema file: ${schemaPath}`);

  } catch (error) {
    console.error('❌ Error generating schema:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  deployToSupabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { deployToSupabase };
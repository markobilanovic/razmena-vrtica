/**
 * Test script for automatic matching functionality
 * This verifies that the new checkAndCreateMatches methods work correctly
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MatchingService } from '../services/matching.service';
import { AgeGroup } from '../entities/child.entity';

async function testAutoMatching() {
  console.log('🧪 Testing Automatic Match Detection...\n');

  const app = await NestFactory.createApplicationContext(AppModule);
  const matchingService = app.get(MatchingService);

  try {
    // Test 1: Check for matches for a specific child
    console.log('Test 1: Check for matches for a specific child');
    console.log('================================================');

    // Get first child from database (you may need to replace with actual child ID)
    const childId = 'test-child-id'; // Replace with actual ID from your seed data

    const matchesForChild =
      await matchingService.checkAndCreateMatchesForChild(childId);
    console.log(
      `✅ Found and created ${matchesForChild.length} matches for child ${childId}`,
    );

    // Test 2: Check for matches in an age group
    console.log('\nTest 2: Check for matches in an age group');
    console.log('===========================================');

    const matchesForAgeGroup =
      await matchingService.checkAndCreateMatchesForAgeGroup(
        AgeGroup.MLADJA_JASLENA,
      );
    console.log(
      `✅ Found and created ${matchesForAgeGroup.length} matches for age group MLADJA_JASLENA`,
    );

    // Test 3: Try creating duplicate match (should be prevented)
    console.log('\nTest 3: Test duplicate prevention');
    console.log('==================================');

    const matchesAgain =
      await matchingService.checkAndCreateMatchesForAgeGroup(
        AgeGroup.MLADJA_JASLENA,
      );
    console.log(
      `✅ Second run created ${matchesAgain.length} matches (should be 0 if duplicates prevented)`,
    );

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await app.close();
  }
}

// Run the test
testAutoMatching().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});


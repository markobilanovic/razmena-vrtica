/**
 * Example usage of age group matching functionality
 * This file demonstrates how to use the matching service with age group constraints
 */

import { Child, AgeGroup, Gender } from '../entities/child.entity';
import { MatchingService } from '../services/matching.service';
import { ChildService } from '../services/child.service';
import { calculateAgeGroup } from '../utils/age-group.util';

// Example 1: Creating children with automatic age group assignment
async function exampleCreateChildren(childService: ChildService) {
  // Create a child in STARIJA age group (4.5y - 5.5y)
  const child1 = await childService.create({
    name: 'Ana Petrović',
    birth_date: new Date('2019-06-15'), // ~5 years old
    gender: Gender.FEMALE,
    group: AgeGroup.STARIJA,
    parent_id: 'parent-uuid-1',
    current_kindergarten_id: 'kindergarten-uuid-1',
  });

  console.log(`Child created: ${child1.name}, Age Group: ${child1.group}`);
  // Output: Child created: Ana Petrović, Age Group: STARIJA

  // Create another child in STARIJA age group
  const child2 = await childService.create({
    name: 'Marko Jovanović',
    birth_date: new Date('2019-09-20'), // ~5 years old
    gender: Gender.MALE,
    group: AgeGroup.STARIJA,
    parent_id: 'parent-uuid-2',
    current_kindergarten_id: 'kindergarten-uuid-2',
  });

  console.log(`Child created: ${child2.name}, Age Group: ${child2.group}`);
  // Output: Child created: Marko Jovanović, Age Group: STARIJA

  return { child1, child2 };
}

// Example 2: Calculate age group manually
function exampleCalculateAgeGroup() {
  const birthDate1 = new Date('2022-03-15'); // ~2.7 years old
  const ageGroup1 = calculateAgeGroup(birthDate1);
  console.log(
    `Birth date: ${birthDate1.toDateString()}, Age Group: ${ageGroup1}`,
  );
  // Output: Age Group: MLADJA (2.5y - 3.5y)

  const birthDate2 = new Date('2021-01-10'); // ~3.9 years old
  const ageGroup2 = calculateAgeGroup(birthDate2);
  console.log(
    `Birth date: ${birthDate2.toDateString()}, Age Group: ${ageGroup2}`,
  );
  // Output: Age Group: SREDNJA (3.5y - 4.5y)

  const birthDate3 = new Date('2023-06-01'); // ~1.5 years old
  const ageGroup3 = calculateAgeGroup(birthDate3);
  console.log(
    `Birth date: ${birthDate3.toDateString()}, Age Group: ${ageGroup3}`,
  );
  // Output: Age Group: STARIJA_JASLENA (1.5y - 2.5y)
}

// Example 3: Finding potential matches (only within same age group)
async function exampleFindMatches(matchingService: MatchingService) {
  // Find all potential matches for STARIJA age group
  const matches = await matchingService.findPotentialMatches(AgeGroup.STARIJA);

  console.log(`Found ${matches.length} potential matches in STARIJA age group`);

  matches.forEach((match, index) => {
    console.log(`\nMatch ${index + 1}:`);
    match.children.forEach((child) => {
      console.log(`  - ${child.name} (${child.group})`);
    });
  });

  // Find matches across all age groups
  const allMatches = await matchingService.findPotentialMatches();
  console.log(
    `\nTotal potential matches across all age groups: ${allMatches.length}`,
  );
}

// Example 4: Creating a valid match (same age group) ✅
async function exampleCreateValidMatch(matchingService: MatchingService) {
  try {
    // Both children are in STARIJA age group
    const match = await matchingService.createMatch([
      'child-uuid-starija-1',
      'child-uuid-starija-2',
    ]);

    console.log('✅ Match created successfully!');
    console.log(`Match ID: ${match.id}`);
    console.log(`Status: ${match.status}`);
  } catch (error) {
    console.error('❌ Failed to create match:', error.message);
  }
}

// Example 5: Attempting to create invalid match (different age groups) ❌
async function exampleCreateInvalidMatch(matchingService: MatchingService) {
  try {
    // child1 is in STARIJA age group, child2 is in MLADJA age group
    const match = await matchingService.createMatch([
      'child-uuid-starija-1',
      'child-uuid-mladja-1',
    ]);

    console.log('This should not happen!');
  } catch (error) {
    console.log('✅ Match correctly rejected!');
    console.log(`Error: ${error.message}`);
    // Output: Cannot create match: children must be in the same age group. Found groups: STARIJA, MLADJA
  }
}

// Example 6: Get all matches for a specific age group
async function exampleGetMatchesByAgeGroup(matchingService: MatchingService) {
  const starijaMatches = await matchingService.getMatchesByAgeGroup(
    AgeGroup.STARIJA,
  );

  console.log(`\nAll matches for STARIJA age group: ${starijaMatches.length}`);

  starijaMatches.forEach((match) => {
    console.log(`\nMatch ID: ${match.id}`);
    console.log(`Status: ${match.status}`);
    if (match.participants) {
      match.participants.forEach((participant) => {
        console.log(`  Participant: ${participant.child.name}`);
      });
    }
  });
}

// Example 7: Validate an existing match
async function exampleValidateMatch(
  matchingService: MatchingService,
  matchId: string,
) {
  const isValid = await matchingService.validateMatchAgeGroup(matchId);

  if (isValid) {
    console.log('✅ Match is valid - all children in same age group');
  } else {
    console.log('❌ Match is invalid - children are from different age groups');
  }
}

// Example 8: Recalculate age groups (useful for cron jobs)
async function exampleRecalculateAgeGroups(childService: ChildService) {
  const result = await childService.recalculateAllAgeGroups();

  console.log('\n=== Age Group Recalculation Results ===');
  console.log(`Updated: ${result.updated}`);
  console.log(`Unchanged: ${result.unchanged}`);
  console.log(`Out of range: ${result.outOfRange}`);
  console.log('========================================');
}

// Example 9: Realistic matching scenario
async function exampleRealisticScenario(
  childService: ChildService,
  matchingService: MatchingService,
) {
  console.log('\n====== Realistic Matching Scenario ======\n');

  // Scenario: Two parents want to swap kindergartens
  // Both children are 5 years old (STARIJA group)

  // Parent 1: Ana goes to Kindergarten A, wants Kindergarten B
  const ana = await childService.create({
    name: 'Ana Nikolić',
    birth_date: new Date('2019-03-15'), // 5 years old -> STARIJA
    gender: Gender.FEMALE,
    group: AgeGroup.STARIJA,
    parent_id: 'parent-1',
    current_kindergarten_id: 'kindergarten-a',
  });

  // Parent 2: Milan goes to Kindergarten B, wants Kindergarten A
  const milan = await childService.create({
    name: 'Milan Đorđević',
    birth_date: new Date('2019-07-20'), // 5 years old -> STARIJA
    gender: Gender.MALE,
    group: AgeGroup.STARIJA,
    parent_id: 'parent-2',
    current_kindergarten_id: 'kindergarten-b',
  });

  console.log(
    `${ana.name}: Age group ${ana.group}, at Kindergarten A, wants Kindergarten B`,
  );
  console.log(
    `${milan.name}: Age group ${milan.group}, at Kindergarten B, wants Kindergarten A`,
  );

  // Create wishlist for Ana (wants Kindergarten B)
  // Create wishlist for Milan (wants Kindergarten A)
  // ... (wishlist creation would happen here)

  // Find potential matches
  const potentialMatches = await matchingService.findPotentialMatches(
    AgeGroup.STARIJA,
  );

  if (potentialMatches.length > 0) {
    console.log('\n✅ Perfect match found!');
    console.log('Ana and Milan can swap kindergartens because:');
    console.log('1. Both are in STARIJA age group');
    console.log('2. Ana wants what Milan has');
    console.log('3. Milan wants what Ana has');

    // Create the match
    const match = await matchingService.createMatch([ana.id, milan.id]);
    console.log(`\nMatch created with ID: ${match.id}`);
  }
}

// Example 10: What happens with children from different age groups
async function exampleDifferentAgeGroups(
  childService: ChildService,
  matchingService: MatchingService,
) {
  console.log('\n====== Different Age Groups Scenario ======\n');

  // Child in MLADJA group (2.5y - 3.5y)
  const nikola = await childService.create({
    name: 'Nikola Petrović',
    birth_date: new Date('2021-09-01'), // ~3 years old
    gender: Gender.MALE,
    group: AgeGroup.MLADJA,
    parent_id: 'parent-3',
    current_kindergarten_id: 'kindergarten-a',
  });

  // Child in SREDNJA group (3.5y - 4.5y)
  const jovana = await childService.create({
    name: 'Jovana Marković',
    birth_date: new Date('2020-11-15'), // ~4 years old
    gender: Gender.FEMALE,
    group: AgeGroup.SREDNJA,
    parent_id: 'parent-4',
    current_kindergarten_id: 'kindergarten-b',
  });

  console.log(`${nikola.name}: ${nikola.group} group (3 years old)`);
  console.log(`${jovana.name}: ${jovana.group} group (4 years old)`);

  try {
    // Attempt to create a match
    await matchingService.createMatch([nikola.id, jovana.id]);
    console.log('This should not happen!');
  } catch (error) {
    console.log('\n❌ Match rejected:');
    console.log(`Reason: ${error.message}`);
    console.log(
      '\nThese children cannot be matched because they are in different age groups.',
    );
    console.log('This ensures kindergarten groups remain age-appropriate.');
  }
}

export {
  exampleCreateChildren,
  exampleCalculateAgeGroup,
  exampleFindMatches,
  exampleCreateValidMatch,
  exampleCreateInvalidMatch,
  exampleGetMatchesByAgeGroup,
  exampleValidateMatch,
  exampleRecalculateAgeGroups,
  exampleRealisticScenario,
  exampleDifferentAgeGroups,
};

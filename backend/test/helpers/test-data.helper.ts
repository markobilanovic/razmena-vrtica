import { AgeGroup } from '../../src/entities/child.entity';

export class TestDataHelper {
  static createChildData(
    name: string,
    ageGroup: AgeGroup,
    kindergartenId: string,
  ) {
    return {
      id: `child-${name.toLowerCase()}`,
      first_name: name,
      last_name: 'Test',
      date_of_birth: new Date('2020-01-01'),
      group: ageGroup,
      current_kindergarten_id: kindergartenId,
      parent_id: `parent-${name.toLowerCase()}`,
      wishlists: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static createWishlistData(childId: string, targetKindergartenId: string) {
    return {
      child_id: childId,
      target_kindergarten_id: targetKindergartenId,
    };
  }

  static createKindergartenData(id: string, name: string) {
    return {
      id,
      name,
      address: `${name} Address`,
      phone: '123-456-7890',
      email: `${id}@example.com`,
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static async waitForAsyncOperations(ms: number = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

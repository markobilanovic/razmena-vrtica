import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGroupToChild1733514134000 implements MigrationInterface {
  name = 'AddGroupToChild1733514134000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(`
            CREATE TYPE "age_group_enum" AS ENUM (
                'MLADJA_JASLENA',
                'STARIJA_JASLENA',
                'MLADJA',
                'SREDNJA',
                'STARIJA',
                'NAJSTARIJA'
            )
        `);

    // Add the column (nullable initially)
    await queryRunner.query(`
            ALTER TABLE "child" 
            ADD "group" "age_group_enum"
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the column
    await queryRunner.query(`
            ALTER TABLE "child" 
            DROP COLUMN "group"
        `);

    // Drop the enum type
    await queryRunner.query(`
            DROP TYPE "age_group_enum"
        `);
  }
}

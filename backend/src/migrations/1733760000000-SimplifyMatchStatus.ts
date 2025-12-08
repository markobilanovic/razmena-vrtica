import { MigrationInterface, QueryRunner } from 'typeorm';

export class SimplifyMatchStatus1733760000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop default first
    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status DROP DEFAULT
    `);

    // Convert column to VARCHAR to allow any value
    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status TYPE VARCHAR(50)
    `);

    // Update existing PENDING_ACCEPTANCE and ACTIVE_CONTACT to ACTIVE
    await queryRunner.query(`
      UPDATE match_group 
      SET status = 'ACTIVE' 
      WHERE status IN ('PENDING_ACCEPTANCE', 'ACTIVE_CONTACT')
    `);

    // Drop old enum type (now safe since column is VARCHAR)
    await queryRunner.query(`
      DROP TYPE IF EXISTS match_group_status_enum
    `);

    // Create new enum type with only ACTIVE, COMPLETED, CANCELLED
    await queryRunner.query(`
      CREATE TYPE match_group_status_enum AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED')
    `);

    // Convert column back to enum
    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status TYPE match_group_status_enum 
      USING status::match_group_status_enum
    `);

    // Set default value
    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status SET DEFAULT 'ACTIVE'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to old enum with PENDING_ACCEPTANCE and ACTIVE_CONTACT
    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status TYPE VARCHAR(50)
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS match_group_status_enum
    `);

    await queryRunner.query(`
      CREATE TYPE match_group_status_enum AS ENUM ('PENDING_ACCEPTANCE', 'ACTIVE_CONTACT', 'COMPLETED', 'CANCELLED')
    `);

    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status TYPE match_group_status_enum 
      USING status::match_group_status_enum
    `);

    await queryRunner.query(`
      ALTER TABLE match_group 
      ALTER COLUMN status SET DEFAULT 'PENDING_ACCEPTANCE'
    `);

    // Convert ACTIVE back to PENDING_ACCEPTANCE
    await queryRunner.query(`
      UPDATE match_group 
      SET status = 'PENDING_ACCEPTANCE' 
      WHERE status = 'ACTIVE'
    `);
  }
}

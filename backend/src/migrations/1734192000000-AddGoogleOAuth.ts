import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddGoogleOAuth1734192000000 implements MigrationInterface {
  name = 'AddGoogleOAuth1734192000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "google_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "UQ_user_google_id" UNIQUE ("google_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "UQ_user_google_id"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "google_id"`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHiddenMatchTable1733680000000 implements MigrationInterface {
  name = 'CreateHiddenMatchTable1733680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "hidden_match" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "match_group_id" uuid NOT NULL,
        "hidden_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_hidden_match_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_hidden_match_user" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_hidden_match_group" FOREIGN KEY ("match_group_id") REFERENCES "match_group"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_hidden_match_user_group" UNIQUE ("user_id", "match_group_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_hidden_match_user_id" ON "hidden_match" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_hidden_match_group_id" ON "hidden_match" ("match_group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_hidden_match_group_id"`);
    await queryRunner.query(`DROP INDEX "IDX_hidden_match_user_id"`);
    await queryRunner.query(`DROP TABLE "hidden_match"`);
  }
}

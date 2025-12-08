import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddEmailConfirmation1733673600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'email_confirmed',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'email_confirmation_token',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'user',
      new TableColumn({
        name: 'email_confirmation_token_expires',
        type: 'timestamp',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('user', 'email_confirmation_token_expires');
    await queryRunner.dropColumn('user', 'email_confirmation_token');
    await queryRunner.dropColumn('user', 'email_confirmed');
  }
}

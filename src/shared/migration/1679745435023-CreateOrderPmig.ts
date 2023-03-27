import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrderPmig1679745435023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_products',
        columns: [
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'productId',
            type: 'int',
          },
          {
            name: 'count',
            type: 'int',
          },
          {
            name: 'price',
            type: 'int',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['productId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'product',
            onDelete: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_products');
  }
}

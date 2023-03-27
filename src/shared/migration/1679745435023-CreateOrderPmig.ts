import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrderPmig1679745435023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_products',
        columns: [
          {
            name: 'order_id',
            type: 'int',
          },
          {
            name: 'product_id',
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
            columnNames: ['order_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'order',
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['product_id'],
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

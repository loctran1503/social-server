import { MigrationInterface, QueryRunner } from "typeorm";

export class EditFirebaseId1673802265637 implements MigrationInterface {
    name = 'EditFirebaseId1673802265637'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_1c2d0bf809fd5f537a43d8f8d8e"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_1c2d0bf809fd5f537a43d8f8d8e" UNIQUE ("firebaseId")`);
    }

}

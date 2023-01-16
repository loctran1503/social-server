import { MigrationInterface, QueryRunner } from "typeorm";

export class DatabaseInit1673754498271 implements MigrationInterface {
    name = 'DatabaseInit1673754498271'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebaseId" character varying NOT NULL, "name" character varying NOT NULL, "avatar" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1c2d0bf809fd5f537a43d8f8d8e" UNIQUE ("firebaseId"), CONSTRAINT "PK_8bf09ba754322ab9c22a215c919" PRIMARY KEY ("userId"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
    }

}

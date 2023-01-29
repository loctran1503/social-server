import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCommunityMediaMessageTable1674387226359 implements MigrationInterface {
    name = 'AddCommunityMediaMessageTable1674387226359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "media-messages" ("mediaId" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "mimeType" character varying NOT NULL, "size" integer NOT NULL, "location" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9407502c32a2741e0e6b6335b60" PRIMARY KEY ("mediaId"))`);
        await queryRunner.query(`ALTER TABLE "community-messages" ADD "mediaMediaId" uuid`);
        await queryRunner.query(`ALTER TABLE "community-messages" ADD CONSTRAINT "UQ_ce56b6f39bdfbbd90dfe0edfbe5" UNIQUE ("mediaMediaId")`);
        await queryRunner.query(`ALTER TABLE "community-messages" ADD CONSTRAINT "FK_ce56b6f39bdfbbd90dfe0edfbe5" FOREIGN KEY ("mediaMediaId") REFERENCES "media-messages"("mediaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community-messages" DROP CONSTRAINT "FK_ce56b6f39bdfbbd90dfe0edfbe5"`);
        await queryRunner.query(`ALTER TABLE "community-messages" DROP CONSTRAINT "UQ_ce56b6f39bdfbbd90dfe0edfbe5"`);
        await queryRunner.query(`ALTER TABLE "community-messages" DROP COLUMN "mediaMediaId"`);
        await queryRunner.query(`DROP TABLE "media-messages"`);
    }

}

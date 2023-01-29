import { MigrationInterface, QueryRunner } from "typeorm";

export class Test1674403614286 implements MigrationInterface {
    name = 'Test1674403614286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chats-room" ("chatroomId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userOneUserId" uuid, "userTwoUserId" uuid, CONSTRAINT "PK_24b46aaf9f5129d069899e4b846" PRIMARY KEY ("chatroomId"))`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d" FOREIGN KEY ("userOneUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee" FOREIGN KEY ("userTwoUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee"`);
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d"`);
        await queryRunner.query(`DROP TABLE "chats-room"`);
    }

}

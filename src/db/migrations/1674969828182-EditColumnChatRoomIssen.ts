import { MigrationInterface, QueryRunner } from "typeorm";

export class EditColumnChatRoomIssen1674969828182 implements MigrationInterface {
    name = 'EditColumnChatRoomIssen1674969828182'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD "isSeen" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d"`);
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee"`);
        await queryRunner.query(`ALTER TABLE "chats-room" ALTER COLUMN "userOneUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats-room" ALTER COLUMN "userTwoUserId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d" FOREIGN KEY ("userOneUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee" FOREIGN KEY ("userTwoUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee"`);
        await queryRunner.query(`ALTER TABLE "chats-room" DROP CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d"`);
        await queryRunner.query(`ALTER TABLE "chats-room" ALTER COLUMN "userTwoUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats-room" ALTER COLUMN "userOneUserId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_cfb12d81e8d5a7955c495394aee" FOREIGN KEY ("userTwoUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room" ADD CONSTRAINT "FK_abbac8f7f6c1a1d050750f7012d" FOREIGN KEY ("userOneUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP COLUMN "isSeen"`);
    }

}

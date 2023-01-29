import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimeStampChatRoomMessage1674568943757 implements MigrationInterface {
    name = 'AddTimeStampChatRoomMessage1674568943757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP COLUMN "timestamp"`);
    }

}

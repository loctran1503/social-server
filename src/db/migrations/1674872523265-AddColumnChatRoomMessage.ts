import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnChatRoomMessage1674872523265 implements MigrationInterface {
    name = 'AddColumnChatRoomMessage1674872523265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD "type" character varying NOT NULL DEFAULT 'text'`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD "emoji" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP COLUMN "emoji"`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP COLUMN "type"`);
    }

}

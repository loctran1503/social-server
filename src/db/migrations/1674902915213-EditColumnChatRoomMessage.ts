import { MigrationInterface, QueryRunner } from "typeorm";

export class EditColumnChatRoomMessage1674902915213 implements MigrationInterface {
    name = 'EditColumnChatRoomMessage1674902915213'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" ALTER COLUMN "content" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" ALTER COLUMN "content" SET NOT NULL`);
    }

}

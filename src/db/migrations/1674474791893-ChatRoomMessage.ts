import { MigrationInterface, QueryRunner } from "typeorm";

export class ChatRoomMessage1674474791893 implements MigrationInterface {
    name = 'ChatRoomMessage1674474791893'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "chats-room-message" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "userUserId" uuid, "chatroomChatroomId" uuid, "mediaMediaId" uuid, CONSTRAINT "REL_0ae99aab3adc72d6a26b425343" UNIQUE ("mediaMediaId"), CONSTRAINT "PK_368e8e68f17f186d323ab3ae6a0" PRIMARY KEY ("messageId"))`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD CONSTRAINT "FK_6add947a3e85801c133cec64717" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD CONSTRAINT "FK_a8e0b7582d4e90c2c36d27dde3c" FOREIGN KEY ("chatroomChatroomId") REFERENCES "chats-room"("chatroomId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" ADD CONSTRAINT "FK_0ae99aab3adc72d6a26b4253432" FOREIGN KEY ("mediaMediaId") REFERENCES "media-messages"("mediaId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP CONSTRAINT "FK_0ae99aab3adc72d6a26b4253432"`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP CONSTRAINT "FK_a8e0b7582d4e90c2c36d27dde3c"`);
        await queryRunner.query(`ALTER TABLE "chats-room-message" DROP CONSTRAINT "FK_6add947a3e85801c133cec64717"`);
        await queryRunner.query(`DROP TABLE "chats-room-message"`);
    }

}

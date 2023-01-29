import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCommunityMessageTable1674108893284 implements MigrationInterface {
    name = 'CreateCommunityMessageTable1674108893284'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "community-messages" ("messageId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userUserId" uuid, CONSTRAINT "PK_ec770e7400cb121cbc661e269a1" PRIMARY KEY ("messageId"))`);
        await queryRunner.query(`CREATE TABLE "userComment" ("userCommentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "contents" character varying NOT NULL, "media" character varying, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userUserId" uuid, "postPostId" uuid, CONSTRAINT "PK_27953da78cd80dbb5b376cebcf4" PRIMARY KEY ("userCommentId"))`);
        await queryRunner.query(`CREATE TABLE "posts" ("postId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "medias" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "userUserId" uuid, CONSTRAINT "PK_cdc670193be6ca43f590dbabcee" PRIMARY KEY ("postId"))`);
        await queryRunner.query(`ALTER TABLE "community-messages" ADD CONSTRAINT "FK_b1ed2791176ab57ee3c3827fac4" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userComment" ADD CONSTRAINT "FK_68a72ef77bc01e49eb030c6f72d" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "userComment" ADD CONSTRAINT "FK_321087c0030cadf55e023b1c54b" FOREIGN KEY ("postPostId") REFERENCES "posts"("postId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "posts" ADD CONSTRAINT "FK_b4855b3fc6710c40dc4eef9cf96" FOREIGN KEY ("userUserId") REFERENCES "users"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP CONSTRAINT "FK_b4855b3fc6710c40dc4eef9cf96"`);
        await queryRunner.query(`ALTER TABLE "userComment" DROP CONSTRAINT "FK_321087c0030cadf55e023b1c54b"`);
        await queryRunner.query(`ALTER TABLE "userComment" DROP CONSTRAINT "FK_68a72ef77bc01e49eb030c6f72d"`);
        await queryRunner.query(`ALTER TABLE "community-messages" DROP CONSTRAINT "FK_b1ed2791176ab57ee3c3827fac4"`);
        await queryRunner.query(`DROP TABLE "posts"`);
        await queryRunner.query(`DROP TABLE "userComment"`);
        await queryRunner.query(`DROP TABLE "community-messages"`);
    }

}

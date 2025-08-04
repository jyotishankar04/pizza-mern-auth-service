import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTanentidFk1754305196465 implements MigrationInterface {
    name = 'AddTanentidFk1754305196465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "tanentId" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_aad25af6f1ceb533c130bb65c29" FOREIGN KEY ("tanentId") REFERENCES "tanents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_aad25af6f1ceb533c130bb65c29"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "tanentId"`);
    }

}

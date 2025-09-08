import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("campaigns", (table) => {
    table.timestamp("created_time");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("campaigns", (table) => {
    table.dropColumn("created_time");
  });
}

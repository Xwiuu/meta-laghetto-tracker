import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_metrics", (table) => {
    table.bigint("cpc_cents");
    table.decimal("ctr"); 
    table.bigint("cpm_cents"); 
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_metrics", (table) => {
    table.dropColumn("cpc_cents");
    table.dropColumn("ctr");
    table.dropColumn("cpm_cents");
  });
}

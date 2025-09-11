import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_metrics', (table) => {
    table.integer('leads').defaultTo(0); // Nova coluna para guardar o número de leads
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('daily_metrics', (table) => {
    table.dropColumn('leads');
  });
}
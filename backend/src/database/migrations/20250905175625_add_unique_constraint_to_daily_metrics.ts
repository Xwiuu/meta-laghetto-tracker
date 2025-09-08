import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_metrics", (table) => {
    // Adiciona a regra de que a combinação de data e ID da campanha deve ser única
    table.unique(["metric_date", "campaign_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("daily_metrics", (table) => {
    // Remove a regra, caso precisemos reverter a migração
    table.dropUnique(["metric_date", "campaign_id"]);
  });
}

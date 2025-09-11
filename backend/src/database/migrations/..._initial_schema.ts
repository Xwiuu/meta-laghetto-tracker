import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Cria a tabela 'users'
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // Cria a tabela 'campaigns' com todas as colunas
  await knex.schema.createTable('campaigns', (table) => {
    table.bigint('id').primary();
    table.string('name').notNullable();
    table.string('status').notNullable();
    table.string('objective');
    table.timestamp('created_time');
  });

  // Cria a tabela 'ad_sets' com todas as colunas
  await knex.schema.createTable('ad_sets', (table) => {
    table.bigint('id').primary();
    table.string('name').notNullable();
    table.string('status').notNullable();
    table.bigint('daily_budget_cents');
    table.bigint('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
    table.timestamp('created_time');
  });

  // Cria a tabela 'daily_metrics' com todas as colunas e regras
  await knex.schema.createTable('daily_metrics', (table) => {
    table.increments('id').primary();
    table.date('metric_date').notNullable();
    table.bigint('spend_cents').notNullable();
    table.integer('impressions');
    table.integer('clicks');
    table.bigint('cpa_cents');
    table.decimal('roas_value', 10, 4);
    table.bigint('cpc_cents');
    table.decimal('ctr');
    table.bigint('cpm_cents');
    table.bigint('campaign_id').references('id').inTable('campaigns').onDelete('CASCADE');
    table.bigint('ad_set_id').references('id').inTable('ad_sets').onDelete('CASCADE');
    table.unique(['metric_date', 'campaign_id', 'ad_set_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Desfaz as operações na ordem inversa
  await knex.schema.dropTable('daily_metrics');
  await knex.schema.dropTable('ad_sets');
  await knex.schema.dropTable('campaigns');
  await knex.schema.dropTable('users');
}
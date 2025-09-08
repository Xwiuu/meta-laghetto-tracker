import { Knex } from "knex";
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
    await knex('users').del()

    await knex('users').insert([
        {
            name: 'Marketing',
            email: 'marketing@laghetto.com.br',
            password_hash: await bcrypt.hash('Laghetto123', 8),
        }
    ])
}
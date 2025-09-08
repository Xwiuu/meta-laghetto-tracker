import knex from "knex";
import knexConfig from "../../knexfile";

const knexInstance = knex(knexConfig.development);

export default knexInstance;

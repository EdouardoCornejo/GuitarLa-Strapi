module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'dpg-cdp6pu5a499b1lmepc20-a.oregon-postgres.render.com'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'guitarla_uei5'),
      user: env('DATABASE_USERNAME', 'root'),
      password: env('DATABASE_PASSWORD', 'ekv4rhKDjIFXnVuo323AjDMsJcqkvyxS'),
      ssl: env.bool('DATABASE_SSL', true),
    },
  },
});

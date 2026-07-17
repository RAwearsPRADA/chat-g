import postgres from "postgres";

const globalForSql = globalThis as unknown as {
    sql: postgres.Sql | undefined;
};

export const sql = postgres(process.env.DATABASE_URL!, {
    max: 15,
    idle_timeout: 30
})

if (process.env.NODE_ENV !== 'production') globalForSql.sql = sql;
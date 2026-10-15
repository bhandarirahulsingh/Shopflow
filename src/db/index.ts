import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '../config/env';

// 1. Create the connection pool using our validated DATABASE_URL
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    max: 20, // Max 20 concurrent connections in pool
    idleTimeoutMillis: 30000, // Close connections that stay idle for > 30s to free RAM
    connectionTimeoutMillis: 3000, // Return an error if a free connection isn't acquired within 3s
});

// 2. Global error listener for idle clients in the pool
// If the DB restarts or drops a socket in the background, catch it here so the server doesn't crash
pool.on('error', (err: Error) => {
    console.error('❌ Unexpected error on idle PostgreSQL client:', err.message);
});

// 3. Helper for standalone, single-query operations (auto borrows & returns a connection)
export const query = async <T extends QueryResultRow = any>(
    text: string,
    params?: any[]
): Promise<QueryResult<T>> => {
    const start = Date.now();
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
        console.log(`⏱️ [DB Query] ${duration}ms | ${text.replace(/\s+/g, ' ').trim()}`);
    }
    return res;
};

// 4. Helper for running multiple queries as a single atomic transaction
// The callback function receives a client; you can run any number of queries on it
export const withTransaction = async <T>(
    callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
    const client = await pool.connect(); // Manually borrow a connection from pool
    try {
        await client.query('BEGIN'); // Start the transaction
        const result = await callback(client); // Let user run their queries with this exclusive client
        await client.query('COMMIT'); // Commit only if no errors
        return result;
    } catch (error) {
        await client.query('ROLLBACK'); // Rollback on any error
        throw error;
    } finally {
        client.release(); // CRITICAL: Return connection to pool rack immediately
    }
};

// 5. Simple test function to verify the connection and catch immediate startup errors
export const testConnection = async (): Promise<void> => {
    try {
        const res = await query('SELECT NOW() as now, current_database() as db');
        console.log(`✅ [DB] Connected to PostgreSQL [${res.rows[0].db}] at ${res.rows[0].now}`);
    } catch (err: any) {
        console.error('❌ [DB] Failed to connect to PostgreSQL:', err.message);
        process.exit(1); // Exit the process if DB is unreachable at startup
    }
};

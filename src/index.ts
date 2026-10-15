import app from './app';
import { env } from './config/env';
import { testConnection, pool } from './db/index';

// -------------------------------------------------------------------------
// SERVER_ID: Identifies which backend replica is handling traffic.
// Set via environment variable in docker-compose.yml.
// Used to PROVE that Nginx load balancer distributes requests correctly.
// -------------------------------------------------------------------------
const SERVER_ID = process.env.SERVER_ID || 'standalone';

async function startServer() {
    // 1. Verify database connectivity BEFORE opening port to traffic
    await testConnection();

    // 2. Start listening for incoming HTTP requests
    const server = app.listen(env.PORT, () => {
        console.log(`🚀 [${SERVER_ID}] ShopFlow API running on port ${env.PORT} [${env.NODE_ENV}]`);
        console.log(`🩺 [${SERVER_ID}] Health check: http://localhost:${env.PORT}/health`);
    });

    // 3. Graceful Shutdown (The Senior Dev Pattern 🛡️)
    // If Docker or Kubernetes sends SIGTERM, or you press Ctrl+C (SIGINT):

    const shutdown = async (signal: string) => {
        console.log(`\n🛑 [${SERVER_ID}] Received ${signal}. Starting graceful shutdown...`);

        // Stop accepting new HTTP requests
        server.close(async () => {
            console.log(`🔒 [${SERVER_ID}] Closed all remaining HTTP connections.`);

            // Close the PostgreSQL connection pool cleanly
            await pool.end();
            console.log(`📦 [${SERVER_ID}] Closed PostgreSQL connection pool.`);

            process.exit(0);
        });

        // If graceful shutdown hangs for > 10s, force kill
        setTimeout(() => {
            console.error(`⚠️ [${SERVER_ID}] Forcing process exit after 10s timeout.`);
            process.exit(1);
        }, 10000);
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

}

startServer();

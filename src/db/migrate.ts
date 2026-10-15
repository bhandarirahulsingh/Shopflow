import fs from 'fs';
import path from 'path';
import { pool, withTransaction } from './index';

async function runMigrations() {
    console.log('🔄 Starting database migrations...');
    // 1. Ensure the tracking table exists
    await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
    // 2. Fetch all migrations that have already been executed
    const { rows } = await pool.query<{ name: string }>(
        'SELECT name FROM schema_migrations ORDER BY id ASC'
    );
    const executedMigrationNames = new Set(rows.map((r) => r.name));
    // 3. Read all .sql files from src/db/migrations/ directory
    const migrationsDir = path.join(process.cwd(), 'src', 'db', 'migrations');
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
    }
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort(); // Sorts alphabetically (e.g. 001_..., 002_...)
    // 4. Run any file that hasn't been executed yet
    let newlyExecutedCount = 0;
    for (const file of files) {
        if (executedMigrationNames.has(file)) {
            continue; // Skip already executed migrations
        }
        console.log(`⏳ Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');
        // Run each migration inside an atomic transaction!
        await withTransaction(async (client) => {
            await client.query(sql);
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
        });
        console.log(`✅ Applied migration: ${file}`);
        newlyExecutedCount++;
    }
    if (newlyExecutedCount === 0) {
        console.log('✨ Database is already up to date. No new migrations.');
    } else {
        console.log(`🎉 Successfully executed ${newlyExecutedCount} migration(s).`);
    }
    await pool.end(); // Close the pool so the CLI script exits cleanly
}
runMigrations().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

async function run() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'dev',
    password: 'dev123',
    database: 'gladpros',
    port: 3306
  });

  const sql = `ALTER TABLE Usuario
  ADD COLUMN IF NOT EXISTS bloqueado BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS bloqueadoEm DATETIME NULL,
  ADD COLUMN IF NOT EXISTS pinSeguranca VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS perguntaSecreta VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS respostaSecreta VARCHAR(255) NULL;`;

  try {
    await conn.execute(sql);
    const [rows] = await conn.query('SHOW COLUMNS FROM Usuario');
    console.log('Columns:');
    console.table(rows.map(r => ({ Field: r.Field, Type: r.Type, Null: r.Null, Default: r.Default })));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await conn.end();
  }
}

run();

import 'dotenv/config';
import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

await conn.query(`
  INSERT INTO siteContent (\`key\`, label, type, value, section)
  VALUES (?, ?, ?, ?, ?)
  ON DUPLICATE KEY UPDATE label = VALUES(label)
`, [
  'raisely.campaign_url',
  'Raisely Campaign URL',
  'text',
  'https://donate.raisely.com/hope-rising-education',
  'donations'
]);

console.log('Seeded raisely.campaign_url');
await conn.end();

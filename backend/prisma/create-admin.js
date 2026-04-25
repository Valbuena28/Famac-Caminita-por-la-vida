const { Pool } = require('pg');
const bcrypt = require('bcrypt');

async function createAdmin() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:1208fvdq*@localhost:5432/sgp_famac',
  });
  
  const hash = await bcrypt.hash('famac2026', 10);
  
  await pool.query(`
    INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
    VALUES (gen_random_uuid(), 'admin@famac.com', $1, 'Administrador', 'FAMAC', 'ADMIN', NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET "passwordHash" = $1
  `, [hash]);
  
  console.log('✅ Usuario creado/actualizado:');
  console.log('   Email:    admin@famac.com');
  console.log('   Password: famac2026');
  
  await pool.end();
}

createAdmin().catch(console.error);

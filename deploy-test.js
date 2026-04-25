const { Client } = require('ssh2');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const config = { host: '69.6.242.161', port: 22022, username: 'root', password: 'oJRjFQSSNYC6' };

console.log('📦 Empaquetando...');
const projectDir = __dirname;
const tarFile = path.join(projectDir, 'sgp-update.tar.gz');
execSync(`tar -czf sgp-update.tar.gz --exclude=node_modules --exclude=.next --exclude=dist --exclude=.git --exclude=sgp-update.tar.gz --exclude=package-lock.json -C "${projectDir}" frontend backend`, { cwd: projectDir, stdio: 'inherit' });
console.log(`✅ ${(fs.statSync(tarFile).size / 1024 / 1024).toFixed(1)} MB\n`);

const conn = new Client();
conn.on('ready', () => {
  console.log('📤 Subiendo...');
  conn.sftp((err, sftp) => {
    if (err) { console.error(err); conn.end(); return; }
    const rs = fs.createReadStream(tarFile);
    const ws = sftp.createWriteStream('/root/sgp-update.tar.gz');
    const total = fs.statSync(tarFile).size;
    let up = 0;
    rs.on('data', (c) => { up += c.length; process.stdout.write(`\r   ${((up/total)*100).toFixed(0)}%`); });
    ws.on('close', () => { console.log(' ✅\n'); sftp.end(); deploy(); });
    rs.pipe(ws);
  });
});

function deploy() {
  const script = `
set -e
echo "📂 Extrayendo..."
cd /root/SGP-FAMAC
rm -rf frontend/src backend/src
tar -xzf /root/sgp-update.tar.gz -C /root/SGP-FAMAC/
rm /root/sgp-update.tar.gz

echo "🔨 Backend..."
cd /root/SGP-FAMAC/backend && npm run build 2>&1 | tail -3

echo "🎨 Frontend..."
cd /root/SGP-FAMAC/frontend
echo 'NEXT_PUBLIC_API_URL=http://69.6.242.161:3005' > .env.local
npm run build 2>&1 | tail -15

echo "🔄 Reiniciando..."
pm2 restart all
sleep 4
pm2 list
echo ""
echo "✅ Deploy completo!"
`;
  conn.exec(script, { pty: true }, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', (d) => process.stdout.write(d));
    stream.stderr.on('data', (d) => process.stderr.write(d));
    stream.on('close', () => { console.log('\n🏁 Done!'); try { fs.unlinkSync(tarFile); } catch(e) {} conn.end(); });
  });
}

conn.on('error', (e) => { console.error('❌', e.message); process.exit(1); });
conn.connect(config);

import express from 'express';
import fs from 'fs';
import https from 'https';
import path from 'path';
import selfsigned from 'selfsigned';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;
const enableHttps = process.env.HTTPS !== 'false';
const certDir = path.join(__dirname, '.cert');
const keyPath = path.join(certDir, 'localhost.key');
const certPath = path.join(certDir, 'localhost.crt');

const csp =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://ya-praktikum.tech data: blob:; font-src 'self'; connect-src 'self' https://ya-praktikum.tech wss://ya-praktikum.tech; base-uri 'self'; form-action 'self'; frame-ancestors 'none';";

app.use((_, res, next) => {
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  next();
});

app.use(express.static(path.join(__dirname, 'dist')));

app.use((_, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const ensureCert = () => {
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath, 'utf8'),
      cert: fs.readFileSync(certPath, 'utf8'),
    };
  }

  fs.mkdirSync(certDir, { recursive: true });
  const { private: key, cert } = selfsigned.generate(
    [
      { name: 'commonName', value: 'localhost' },
      { name: 'organizationName', value: 'localhost' },
    ],
    { days: 365, keySize: 2048, algorithm: 'sha256' }
  );
  fs.writeFileSync(keyPath, key);
  fs.writeFileSync(certPath, cert);
  return { key, cert };
};

if (enableHttps) {
  const credentials = ensureCert();
  https.createServer(credentials, app).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on https://localhost:${port}`);
  });
} else {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on http://localhost:${port}`);
  });
}


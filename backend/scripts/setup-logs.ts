import * as fs from 'fs';
import * as path from 'path';

const logDir = path.join(process.cwd(), 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
  console.log('Logs directory created');
} else {
  console.log('Logs directory already exists');
}

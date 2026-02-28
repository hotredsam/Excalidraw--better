import * as fs from 'fs';
import * as path from 'path';
import text from 'png-chunk-text';
import crc from 'crc';

function createChunk(name: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const nameBuf = Buffer.from(name, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc.crc32(Buffer.concat([nameBuf, data])));
  return Buffer.concat([length, nameBuf, data, crcBuf]);
}

const PNG_HEADER = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IHDR = createChunk('IHDR', Buffer.from([0, 0, 0, 1, 0, 0, 0, 1, 8, 2, 0, 0, 0]));
const IDAT = createChunk('IDAT', Buffer.from([120, 156, 99, 0, 0, 0, 2, 0, 1]));
const IEND = createChunk('IEND', Buffer.from([]));

const fixturesDir = path.join(__dirname, '../fixtures');
const jsonPath = path.join(fixturesDir, 'sample.excalidraw');
const pngPath = path.join(fixturesDir, 'sample.excalidraw.png');

if (!fs.existsSync(jsonPath)) {
  console.error(`Fixture not found: ${jsonPath}`);
  process.exit(1);
}

const sceneJson = fs.readFileSync(jsonPath, 'utf-8');
const textData = text.encode('Excalidraw', sceneJson);
const TEXT_CHUNK = createChunk('tEXt', Buffer.from(textData.data));

const pngBuffer = Buffer.concat([PNG_HEADER, IHDR, TEXT_CHUNK, IDAT, IEND]);

fs.writeFileSync(pngPath, pngBuffer);
console.log(`Generated fixture: ${pngPath}`);

// PNG pixel sampler (no dependencies).
//
//   node tools/png-sample.mjs <file.png> <x,y> <x,y> ...
//
// Decodes the PNG with zlib and prints the colour at each coordinate, so
// rendered colours can be compared against a reference screenshot.

import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

function decode(path) {
  const buf = readFileSync(path);
  let off = 8;
  let width = 0;
  let height = 0;
  let colorType = 2;
  const idat = [];

  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('latin1', off + 4, off + 8);
    if (type === 'IHDR') {
      width = buf.readUInt32BE(off + 8);
      height = buf.readUInt32BE(off + 12);
      colorType = buf[off + 17];
    }
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    off += 12 + len;
  }

  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  const out = Buffer.alloc(height * stride);
  let pos = 0;

  for (let y = 0; y < height; y++) {
    const filter = raw[pos++];
    const line = raw.subarray(pos, pos + stride);
    pos += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= channels && y > 0) ? out[(y - 1) * stride + x - channels] : 0;
      let v = line[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c);
        const pb = Math.abs(a - c);
        const pc = Math.abs(a + b - 2 * c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      }
      out[y * stride + x] = v & 255;
    }
  }
  return { width, height, stride, channels, out };
}

const [file, ...coords] = process.argv.slice(2);
if (!file || coords.length === 0) {
  console.log('usage: node tools/png-sample.mjs <file.png> <x,y> [...]');
  process.exit(1);
}

const img = decode(file);
console.log(`${file}  ${img.width}x${img.height}  channels=${img.channels}`);

for (const pair of coords) {
  const [x, y] = pair.split(',').map(Number);
  if (!(x >= 0 && x < img.width && y >= 0 && y < img.height)) {
    console.log(`  ${pair.padEnd(12)} out of range`);
    continue;
  }
  const i = y * img.stride + x * img.channels;
  const rgb = [img.out[i], img.out[i + 1], img.out[i + 2]];
  const hex = '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
  console.log(`  ${pair.padEnd(12)} rgb(${rgb.join(',')})  ${hex}`);
}

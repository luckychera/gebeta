import assert from 'node:assert/strict';
import test from 'node:test';
import { base64ByteLength, base64ToBytes, checkImage, guessMimeType, MAX_IMAGE_BYTES } from './imageInput';

test('supported image types pass and others are refused by name', () => {
  assert.equal(checkImage({ mimeType: 'image/jpeg', byteSize: 1000 }).ok, true);
  assert.equal(checkImage({ mimeType: 'image/png', byteSize: 1000 }).ok, true);
  assert.equal(checkImage({ mimeType: 'image/webp', byteSize: 1000 }).ok, true);

  const gif = checkImage({ mimeType: 'image/gif', byteSize: 1000 });
  assert.equal(gif.ok, false);
  assert.match(gif.ok === false ? gif.reason : '', /JPEG, PNG, or WebP/);

  const pdf = checkImage({ mimeType: 'application/pdf', byteSize: 1000 });
  assert.equal(pdf.ok, false);
});

test('an oversized image is refused and the message states both sizes', () => {
  const result = checkImage({ mimeType: 'image/jpeg', byteSize: MAX_IMAGE_BYTES + 1 });
  assert.equal(result.ok, false);
  assert.match(result.ok === false ? result.reason : '', /4\.0 MB/);
});

test('an empty image is refused', () => {
  assert.equal(checkImage({ mimeType: 'image/jpeg', byteSize: 0 }).ok, false);
});

test('an unknown size is allowed through because the server checks it again', () => {
  assert.equal(checkImage({ mimeType: 'image/jpeg', byteSize: null }).ok, true);
});

test('the type is guessed from a data uri or a file extension', () => {
  assert.equal(guessMimeType('data:image/png;base64,AAAA'), 'image/png');
  assert.equal(guessMimeType('file:///tmp/meal.JPG'), 'image/jpeg');
  assert.equal(guessMimeType('https://example.com/a/b.webp?token=1'), 'image/webp');
  assert.equal(guessMimeType('file:///tmp/meal.heic'), null);
  assert.equal(guessMimeType(null), null);
});

test('a file with no recognisable type is refused rather than assumed to be a jpeg', () => {
  const result = checkImage({ reference: 'file:///tmp/meal' });
  assert.equal(result.ok, false);
  assert.match(result.ok === false ? result.reason : '', /could not tell/i);
});

test('base64 length is measured without decoding, including padding', () => {
  assert.equal(base64ByteLength('AAAA'), 3);
  assert.equal(base64ByteLength('AAA='), 2);
  assert.equal(base64ByteLength('AA=='), 1);
  assert.equal(base64ByteLength('data:image/png;base64,AAAA'), 3);
  assert.equal(base64ByteLength(''), 0);
});

test('base64 decoding matches Node for binary content', () => {
  const source = Buffer.from([0, 1, 2, 250, 251, 255, 128, 64]);
  const decoded = base64ToBytes(source.toString('base64'));
  assert.deepEqual([...decoded], [...source]);
});

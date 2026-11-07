import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('Claude covers the complete premium card matrix with self-contained SVGs', () => {
  const files = fs.readdirSync('assets');
  const variants = files.filter(name => name.endsWith('-claude.svg'));
  assert.equal(variants.length, 22);
  for (const name of variants) {
    assert.ok(files.includes(name.replace('-claude.svg', '.svg')), name);
    const svg = fs.readFileSync(`assets/${name}`, 'utf8');
    assert.match(svg, /<svg\b/);
    assert.match(svg, /#17120F/);
    assert.match(svg, /#F5EDE5/);
    assert.doesNotMatch(svg, /<script|<foreignObject|@import/);
  }
});

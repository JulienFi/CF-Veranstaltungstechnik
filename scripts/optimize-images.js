#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ALLOWED_TYPES = new Set(['products', 'projects', 'team']);
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.tif',
  '.tiff',
  '.avif',
  '.gif',
]);

const MAX_LONG_EDGE_PX = 1600;
const JPEG_QUALITY = 80;
const JPEG_PROGRESSIVE = true;
const JPEG_MOZJPEG = true;

const INPUT_ROOT = path.join('assets', 'raw');
const OUTPUT_ROOT = path.join('public', 'images');

const targetType = normalizeType(process.argv[2]);

if (!ALLOWED_TYPES.has(targetType)) {
  printUsage();
  process.exit(1);
}

const workspaceRoot = process.cwd();
const inputDir = path.resolve(workspaceRoot, INPUT_ROOT, targetType);
const outputDir = path.resolve(workspaceRoot, OUTPUT_ROOT, targetType);

await run();

async function run() {
  const inputStats = await safeStat(inputDir);
  if (!inputStats?.isDirectory()) {
    console.error(
      `Input-Ordner nicht gefunden: ${toRelative(inputDir)}\n` +
        'Lege Rohbilder dort ab und starte das Skript erneut.'
    );
    process.exit(1);
  }

  await fs.mkdir(outputDir, { recursive: true });

  const files = await collectFiles(inputDir);
  const summary = {
    scanned: files.length,
    processed: 0,
    created: 0,
    overwritten: 0,
    skipped: [],
    failed: [],
  };

  for (const filePath of files) {
    const extension = path.extname(filePath).toLowerCase();
    if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
      summary.skipped.push(`${toRelative(filePath)} (Nicht-Bilddatei)`);
      continue;
    }

    const sourceName = path.basename(filePath);
    const targetBaseName = `${path.parse(sourceName).name}.jpg`;
    const outputPath = path.join(outputDir, targetBaseName);

    const existedBefore = Boolean(await safeStat(outputPath));
    try {
      await sharp(filePath)
        .rotate()
        .resize({
          width: MAX_LONG_EDGE_PX,
          height: MAX_LONG_EDGE_PX,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({
          quality: JPEG_QUALITY,
          progressive: JPEG_PROGRESSIVE,
          mozjpeg: JPEG_MOZJPEG,
        })
        .toFile(outputPath);

      summary.processed += 1;
      if (existedBefore) {
        summary.overwritten += 1;
        console.log(`Optimiert (ueberschrieben): ${sourceName} -> ${targetBaseName}`);
      } else {
        summary.created += 1;
        console.log(`Optimiert: ${sourceName} -> ${targetBaseName}`);
      }
    } catch (error) {
      summary.failed.push(`${toRelative(filePath)} (${asMessage(error)})`);
    }
  }

  console.log('\n--- Zusammenfassung ---');
  console.log(`Typ: ${targetType}`);
  console.log(`Gelesene Dateien: ${summary.scanned}`);
  console.log(`Verarbeitet: ${summary.processed}`);
  console.log(`Neu erstellt: ${summary.created}`);
  console.log(`Ueberschrieben: ${summary.overwritten}`);
  console.log(`Ausgabeordner: ${toRelative(outputDir)}`);

  if (summary.skipped.length > 0) {
    console.log('\nUebersprungen:');
    for (const item of summary.skipped) {
      console.log(`- ${item}`);
    }
  }

  if (summary.failed.length > 0) {
    console.log('\nFehler:');
    for (const item of summary.failed) {
      console.log(`- ${item}`);
    }
    process.exitCode = 1;
  }
}

async function collectFiles(startDir) {
  const result = [];
  const stack = [startDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    const entries = await fs.readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        result.push(fullPath);
      }
    }
  }

  return result;
}

function normalizeType(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

async function safeStat(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

function toRelative(filePath) {
  return path.relative(workspaceRoot, filePath) || '.';
}

function asMessage(error) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function printUsage() {
  console.error('Usage: node scripts/optimize-images.js <products|projects|team>');
}

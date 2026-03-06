const fs = require('fs');
const path = require('path');

const csvPath = process.argv[2] || 'C:/Users/theid/Downloads/Age of Steam Maps - Summary.csv';
const mapsRoot = 'C:/Users/theid/source/choochoo/src/maps';

function parseCsvLine(line) {
  const out = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function normalize(text) {
  return (text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\bthe\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const symbolToEnum = {
  '?': 'NO_DATA',
  '--': 'NOT_SUPPORTED',
  '-': 'NOT_RECOMMENDED',
  '+': 'RECOMMENDED',
  '++': 'HIGHLY_RECOMMENDED',
  '+++': 'HIGHLY_RECOMMENDED',
  '+-': 'MIXED',
};

const repoNameAlias = {
  australia: 'australia alspach',
  'balkan': 'balkans',
  'chesapeake and ohio': 'chesapeake and ohio railways',
  'chicago l': 'chicago',
  'detroit bankruptcy': 'detroit bankruptcy 2019',
  'heavy cardboard': 'heavy cardboard 1st edition',
  'india': 'india steam bros',
  'ireland': 'ireland wallace',
  'portugal': 'portugal lacerta',
  'sicily': 'sicily bohrer',
  'soul train': 'soul train',
};

function buildCsvMap() {
  const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) {
    throw new Error(`CSV appears invalid: ${csvPath}`);
  }

  const headers = parseCsvLine(lines[1]);
  const indexByHeader = new Map(headers.map((header, index) => [header, index]));
  const mapIndex = indexByHeader.get('Map');
  if (mapIndex == null) {
    throw new Error('CSV missing Map column');
  }

  const byNormName = new Map();
  for (const line of lines.slice(2)) {
    const row = parseCsvLine(line);
    const mapName = (row[mapIndex] || '').trim();
    if (!mapName) continue;

    const ratings = {};
    for (let player = 1; player <= 8; player++) {
      const raw = (row[indexByHeader.get(String(player))] || '').trim();
      if (!raw) continue;
      const mapped = symbolToEnum[raw];
      if (!mapped) continue;
      ratings[player] = mapped;
    }

    byNormName.set(normalize(mapName), {
      mapName,
      ratings,
    });
  }

  return byNormName;
}

function ensurePlayerCountRatingImport(content) {
  if (content.includes('PlayerCountRating')) {
    return content;
  }

  const mapSettingsImportPattern = /import\s*\{([\s\S]*?)\}\s*from\s*"\.\.\/\.\.\/engine\/game\/map_settings";/m;
  const match = content.match(mapSettingsImportPattern);
  if (!match) {
    return content;
  }

  if (match[1].includes('PlayerCountRating')) {
    return content;
  }

  const importLines = match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/,$/, ''));
  importLines.push('PlayerCountRating');
  const deduped = Array.from(new Set(importLines));
  const rebuilt = `\n  ${deduped.join(',\n  ')},\n`;
  const updated = match[0].replace(match[1], rebuilt);
  return content.replace(match[0], updated);
}

function upsertRatingsProperty(content, ratingsObject) {
  const ratingsLines = Object.keys(ratingsObject)
    .map((key) => Number(key))
    .sort((a, b) => a - b)
    .map((player) => `    ${player}: PlayerCountRating.${ratingsObject[player]},`);

  if (ratingsLines.length === 0) {
    return content;
  }

  const block = `  readonly playerCountRatings = {\n${ratingsLines.join('\n')}\n  };`;

  const existingPattern = /  readonly playerCountRatings = \{[\s\S]*?\n  \};/m;
  if (existingPattern.test(content)) {
    return content.replace(existingPattern, block);
  }

  const maxPlayersPattern = /  readonly maxPlayers = \d+;/;
  if (maxPlayersPattern.test(content)) {
    return content.replace(maxPlayersPattern, (line) => `${line}\n${block}`);
  }

  return content;
}

function run() {
  const csvMap = buildCsvMap();

  const dirs = fs
    .readdirSync(mapsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((dir) => dir !== 'template');

  let updatedCount = 0;
  const unmatched = [];

  for (const dir of dirs) {
    const settingsPath = path.join(mapsRoot, dir, 'settings.ts');
    if (!fs.existsSync(settingsPath)) continue;

    const original = fs.readFileSync(settingsPath, 'utf8');
    const nameMatch = original.match(/readonly name = "([^"]+)";/);
    if (!nameMatch) continue;

    const mapName = nameMatch[1];
    let lookup = normalize(mapName);
    if (!csvMap.has(lookup) && repoNameAlias[lookup]) {
      lookup = repoNameAlias[lookup];
    }

    const csvRow = csvMap.get(lookup);
    if (!csvRow) {
      unmatched.push(mapName);
      continue;
    }

    let updated = ensurePlayerCountRatingImport(original);
    updated = upsertRatingsProperty(updated, csvRow.ratings);

    if (updated !== original) {
      fs.writeFileSync(settingsPath, updated, 'utf8');
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} settings files from CSV`);
  if (unmatched.length > 0) {
    console.log(`Unmatched (${unmatched.length}): ${unmatched.join(' | ')}`);
  }
}

run();

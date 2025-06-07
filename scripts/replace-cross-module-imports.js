// scripts/replace-cross-module-imports.js
// Batch refactor cross-module imports to use the ~ alias
const fs = require('fs')
const path = require('path')

const SRC_DIR = path.resolve(__dirname, '../src')
const TOP_LEVELS = [
  'assets', 'legacy', 'modules', 'routes', 'sections', 'shared', 'typings', 'global', 'reset',
]
const exts = ['.ts', '.tsx']

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, cb)
    else if (exts.includes(path.extname(entry.name))) cb(full)
  }
}

function replaceImports(file) {
  let content = fs.readFileSync(file, 'utf8')
  const orig = content
  content = content.replace(
    /from ['"]\.\.\/(assets|legacy|modules|routes|sections|shared|typings|global|reset)\//g,
    'from "~/$1/'
  )
  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8')
    console.log('Updated:', file)
  }
}

walk(SRC_DIR, replaceImports)
console.log('Done.')

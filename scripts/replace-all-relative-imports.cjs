// scripts/replace-all-relative-imports.cjs
// Batch refactor: convert all relative imports in src/ to ~ alias imports (robust for multiline, type-only, and all quote types)
const fs = require('fs')
const path = require('path')

const SRC_DIR = path.resolve(__dirname, '../src')
const exts = ['.ts', '.tsx']

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, cb)
    else if (exts.includes(path.extname(entry.name))) cb(full)
  }
}

function toAlias(fromPath, importPath) {
  if (!importPath.startsWith('.')) return null
  const absImport = path.resolve(path.dirname(fromPath), importPath)
  if (!absImport.startsWith(SRC_DIR)) return null
  const relToSrc = path.relative(SRC_DIR, absImport)
  return `~/${relToSrc.replace(/\\/g, '/')}`
}

function replaceImports(file) {
  let content = fs.readFileSync(file, 'utf8')
  const orig = content
  // Handles import ... from '...' and import ... from "..." and import type ... from ...
  // Handles multiline imports as well
  content = content.replace(/(import(?:\s+type)?(?:[\s\S]*?)from\s+)(['"])(\.[^'"\n]*)\2/g, (match, importStart, quote, importPath) => {
    const alias = toAlias(file, importPath)
    if (alias) {
      console.log(`Updated: ${file} (${importPath} -> ${alias})`)
      return `${importStart}${quote}${alias}${quote}`
    }
    return match
  })
  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8')
  }
}

walk(SRC_DIR, replaceImports)
console.log('Done.')

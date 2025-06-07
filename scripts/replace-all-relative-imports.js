// scripts/replace-all-relative-imports.js
// Batch refactor: convert all relative imports in src/ to ~ alias imports
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
  // Only handle ./ and ../ imports
  if (!importPath.startsWith('.')) return null
  const absImport = path.resolve(path.dirname(fromPath), importPath)
  if (!absImport.startsWith(SRC_DIR)) return null // Only rewrite if inside src
  const relToSrc = path.relative(SRC_DIR, absImport)
  return `~/${relToSrc.replace(/\\/g, '/')}`
}

function replaceImports(file) {
  let content = fs.readFileSync(file, 'utf8')
  const orig = content
  // Handles import ... from '...' and import ... from "..."
  content = content.replace(/from\s+(['"])(\.[^'"\n]*)\1/g, (match, quote, importPath) => {
    const alias = toAlias(file, importPath)
    if (alias) {
      console.log(`Updated: ${file} (${importPath} -> ${alias})`)
      return `from ${quote}${alias}${quote}`
    }
    return match
  })
  if (content !== orig) {
    fs.writeFileSync(file, content, 'utf8')
  }
}

walk(SRC_DIR, replaceImports)
console.log('Done.')

import {buildParserFile, GenError} from ".."

let file = undefined, out = undefined, moduleStyle = "es", includeNames = false, exportName = undefined, noTerms = false

let {writeFileSync, readFileSync} = require("fs")

const usage = "Usage: lezer-generator [--cjs] [--names] [--noTerms] [--output outfile] [--export name] file"

for (let i = 2; i < process.argv.length;) {
  let arg = process.argv[i++]
  if (!/^-/.test(arg)) {
    if (file) error("Multiple input files given")
    file = arg
  } else if (arg == "--help") {
    console.log(usage)
    process.exit(0)
  } else if (arg == "--cjs") {
    moduleStyle = "cjs"
  } else if (arg == "-o" || arg == "--output") {
    if (out) error("Multiple output files given")
    out = process.argv[i++]
  } else if (arg == "--names") {
    includeNames = true
  } else if (arg == "--export") {
    exportName = process.argv[i++]
  } else if (arg == "--noTerms") {
    noTerms = true
  } else {
    error("Unrecognized option " + arg)
  }
}

if (!file) error("No input file given")

function error(msg: string) {
  console.error(msg)
  console.log(usage)
  process.exit(1)
}

let parser, terms
try {
  ;({parser, terms} = buildParserFile(readFileSync(file, "utf8"), {fileName: file, moduleStyle, includeNames, exportName}))
} catch (e) {
  console.error(e instanceof GenError ? e.message : e.stack)
  process.exit(1)
}

if (out) {
  let ext = /^(.*)\.(c?js|mjs|ts|esm?)$/.exec(out)
  let [parserFile, termFile] = ext ? [out, ext[1] + ".terms." + ext[2]] : [out + ".js", out + ".terms.js"]
  writeFileSync(parserFile, parser)
  if (!noTerms) writeFileSync(termFile, terms)
  console.log(`Wrote ${parserFile}${noTerms ? "" : ` and ${termFile}`}`)
} else {
  console.log(parser)
}

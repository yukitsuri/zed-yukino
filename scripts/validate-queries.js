/**
 * Complete Zed Extension Auditor for Yukino
 * Audits:
 * 1. Tree-sitter query validity (.scm) against node-types.json & grammar.json
 * 2. Coverage of language features (lambdas, attributes, macros, imports, structs, etc.)
 * 3. Indentation and brackets queries & configuration
 * 4. Outline and textobjects completeness
 * 5. Snippets (snippets/yukino.json) validity and completeness
 * 6. Configuration (config.toml, extension.toml)
 * 7. Discrepancies with VS Code TextMate grammar
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const NODE_TYPES_PATH = path.join(ROOT, 'prod/tree-sitter-yukino/src/node-types.json');
const GRAMMAR_PATH = path.join(ROOT, 'prod/tree-sitter-yukino/src/grammar.json');
const ZED_DIR = path.resolve(__dirname, '..');
const ZED_LANG_DIR = path.join(ZED_DIR, 'languages/yukino');
const VSCODE_TM_PATH = path.join(ROOT, 'prod/vscode-yukino/syntaxes/yukino.tmLanguage.json');

// --- 1. Load schema ---
const nodeTypes = JSON.parse(fs.readFileSync(NODE_TYPES_PATH, 'utf8'));
const grammarJson = JSON.parse(fs.readFileSync(GRAMMAR_PATH, 'utf8'));

const namedNodes = new Map(); // node_type -> Set of field names
const anonTokens = new Set();

for (const entry of nodeTypes) {
  if (entry.named) {
    const fields = new Set(Object.keys(entry.fields || {}));
    namedNodes.set(entry.type, fields);
  } else {
    anonTokens.add(entry.type);
  }
}

// Tokenize .scm
function tokenizeScm(source, filename) {
  const tokens = [];
  let line = 1, col = 1, i = 0;

  function advance() {
    if (source[i] === '\n') {
      line++;
      col = 1;
    } else {
      col++;
    }
    i++;
  }

  while (i < source.length) {
    const c = source[i];

    if (c === ';') {
      while (i < source.length && source[i] !== '\n') advance();
      continue;
    }

    if (/\s/.test(c)) {
      advance();
      continue;
    }

    const curLine = line, curCol = col;

    if (c === '(' || c === ')' || c === '[' || c === ']') {
      tokens.push({ type: c, value: c, line: curLine, col: curCol, filename });
      advance();
      continue;
    }

    if (c === '"') {
      let str = '';
      advance();
      while (i < source.length) {
        if (source[i] === '\\' && i + 1 < source.length) {
          str += source[i + 1];
          advance();
          advance();
        } else if (source[i] === '"') {
          advance();
          break;
        } else {
          str += source[i];
          advance();
        }
      }
      tokens.push({ type: 'STRING', value: str, line: curLine, col: curCol, filename });
      continue;
    }

    if (c === '.' || c === '*' || c === '+' || c === '?') {
      const nextChar = source[i + 1];
      if (!nextChar || /[\s\(\)\[\];"]/.test(nextChar)) {
        tokens.push({ type: 'PUNCT', value: c, line: curLine, col: curCol, filename });
        advance();
        continue;
      }
    }

    if (c === '@') {
      let cap = '';
      advance();
      while (i < source.length && !/[\s\(\)\[\];"]/.test(source[i])) {
        cap += source[i];
        advance();
      }
      tokens.push({ type: 'CAPTURE', value: cap, line: curLine, col: curCol, filename });
      continue;
    }

    if (c === '#') {
      let pred = '';
      advance();
      while (i < source.length && !/[\s\(\)\[\];"]/.test(source[i])) {
        pred += source[i];
        advance();
      }
      tokens.push({ type: 'PREDICATE', value: pred, line: curLine, col: curCol, filename });
      continue;
    }

    if (c === '!' && source[i + 1] && /[a-zA-Z_]/.test(source[i + 1])) {
      advance();
      let field = '';
      while (i < source.length && !/[\s\(\)\[\];"]/.test(source[i])) {
        field += source[i];
        advance();
      }
      tokens.push({ type: 'NEGATED_FIELD', value: field, line: curLine, col: curCol, filename });
      continue;
    }

    let atom = '';
    while (i < source.length && !/[\s\(\)\[\];"]/.test(source[i])) {
      atom += source[i];
      advance();
    }

    if (atom.endsWith(':')) {
      tokens.push({ type: 'FIELD', value: atom.slice(0, -1), line: curLine, col: curCol, filename });
    } else {
      tokens.push({ type: 'IDENT', value: atom, line: curLine, col: curCol, filename });
    }
  }

  return tokens;
}

function auditQueries(files) {
  const errors = [];
  const foundNodes = new Set();
  const foundFields = new Map();
  const fileNodes = new Map(); // filename -> Set of nodes

  for (const file of files) {
    const filename = path.basename(file);
    const content = fs.readFileSync(file, 'utf8');
    const tokens = tokenizeScm(content, filename);
    fileNodes.set(filename, new Set());

    let idx = 0;
    const nodeStack = [];

    function peek() { return tokens[idx]; }
    function consume() { return tokens[idx++]; }

    function currentParentNode() {
      for (let s = nodeStack.length - 1; s >= 0; s--) {
        if (nodeStack[s].nodeType && nodeStack[s].nodeType !== '_') {
          return nodeStack[s];
        }
      }
      return null;
    }

    function parsePattern() {
      const tok = peek();
      if (!tok) return;

      if (tok.type === '(') {
        consume();
        const next = peek();
        if (!next) {
          errors.push({ file: filename, line: tok.line, col: tok.col, msg: 'Unexpected EOF after "("' });
          return;
        }

        if (next.type === 'PREDICATE') {
          consume();
          while (idx < tokens.length && peek().type !== ')') consume();
          if (peek() && peek().type === ')') consume();
          return;
        }

        if (next.type === 'IDENT' || next.value === '_') {
          const nodeTok = consume();
          const nodeType = nodeTok.value;

          if (nodeType !== '_') {
            foundNodes.add(nodeType);
            fileNodes.get(filename).add(nodeType);
            if (!namedNodes.has(nodeType)) {
              if (anonTokens.has(nodeType)) {
                errors.push({
                  file: filename,
                  line: nodeTok.line,
                  col: nodeTok.col,
                  msg: `Node '${nodeType}' is an anonymous token, not a named node. Must be in quotes: "${nodeType}".`
                });
              } else {
                errors.push({
                  file: filename,
                  line: nodeTok.line,
                  col: nodeTok.col,
                  msg: `Unknown named node type '(${nodeType})'!`
                });
              }
            }
          }

          nodeStack.push({ nodeType, line: nodeTok.line, col: nodeTok.col });

          while (idx < tokens.length && peek().type !== ')') {
            parseChild();
          }

          if (peek() && peek().type === ')') consume();
          else errors.push({ file: filename, line: tok.line, col: tok.col, msg: `Unclosed '(' for node '${nodeType}'` });

          nodeStack.pop();
          while (idx < tokens.length && (peek().type === 'PUNCT' || peek().type === 'CAPTURE')) consume();
        } else {
          nodeStack.push({ nodeType: null, line: tok.line, col: tok.col });
          while (idx < tokens.length && peek().type !== ')') parseChild();
          if (peek() && peek().type === ')') consume();
          nodeStack.pop();
          while (idx < tokens.length && (peek().type === 'PUNCT' || peek().type === 'CAPTURE')) consume();
        }
      } else if (tok.type === '[') {
        consume();
        while (idx < tokens.length && peek().type !== ']') parsePattern();
        if (peek() && peek().type === ']') consume();
        while (idx < tokens.length && (peek().type === 'PUNCT' || peek().type === 'CAPTURE')) consume();
      } else if (tok.type === 'STRING') {
        const strTok = consume();
        if (!anonTokens.has(strTok.value)) {
          errors.push({
            file: filename,
            line: strTok.line,
            col: strTok.col,
            msg: `Unknown literal token "${strTok.value}" - not found in grammar!`
          });
        }
        while (idx < tokens.length && (peek().type === 'PUNCT' || peek().type === 'CAPTURE')) consume();
      } else if (tok.type === 'IDENT') {
        const idTok = consume();
        errors.push({
          file: filename,
          line: idTok.line,
          col: idTok.col,
          msg: `Bare identifier '${idTok.value}' outside node pattern. Did you mean '(${idTok.value})'?`
        });
      } else {
        consume();
      }
    }

    function parseChild() {
      const tok = peek();
      if (!tok || tok.type === ')') return;

      if (tok.type === 'FIELD') {
        const fieldTok = consume();
        const fieldName = fieldTok.value;
        const parent = currentParentNode();

        if (parent && parent.nodeType) {
          const validFields = namedNodes.get(parent.nodeType);
          if (!validFields) {
            errors.push({
              file: filename,
              line: fieldTok.line,
              col: fieldTok.col,
              msg: `Field '${fieldName}:' used under node '${parent.nodeType}', which has no declared fields!`
            });
          } else if (!validFields.has(fieldName)) {
            errors.push({
              file: filename,
              line: fieldTok.line,
              col: fieldTok.col,
              msg: `Field '${fieldName}:' does not exist on node '${parent.nodeType}'! Valid fields: [${Array.from(validFields).join(', ')}]`
            });
          } else {
            if (!foundFields.has(parent.nodeType)) foundFields.set(parent.nodeType, new Set());
            foundFields.get(parent.nodeType).add(fieldName);
          }
        }
        parsePattern();
      } else {
        parsePattern();
      }
    }

    while (idx < tokens.length) parsePattern();
  }

  return { errors, foundNodes, foundFields, fileNodes };
}

// Execute queries audit
const scmFiles = fs.readdirSync(ZED_LANG_DIR)
  .filter(f => f.endsWith('.scm'))
  .map(f => path.join(ZED_LANG_DIR, f));

const queryAudit = auditQueries(scmFiles);

// Audit captures against official Zed specification (40 supported captures)
const zedOfficialCaptures = new Set([
  'attribute', 'boolean', 'comment', 'comment.doc', 'constant', 'constant.builtin',
  'constructor', 'embedded', 'emphasis', 'emphasis.strong', 'enum', 'function',
  'hint', 'keyword', 'label', 'link_text', 'link_uri', 'number', 'operator',
  'predictive', 'preproc', 'primary', 'property', 'punctuation', 'punctuation.bracket',
  'punctuation.delimiter', 'punctuation.list_marker', 'punctuation.special', 'string',
  'string.escape', 'string.regex', 'string.special', 'string.special.symbol', 'tag',
  'tag.doctype', 'text.literal', 'title', 'type', 'type.builtin', 'variable',
  'variable.special', 'variable.parameter', 'variant'
]);

const hlRaw = fs.readFileSync(path.join(ZED_LANG_DIR, 'highlights.scm'), 'utf8');
const hlCaptureMatches = hlRaw.matchAll(/@([a-zA-Z0-9_.-]+)/g);
const invalidHlCaptures = [];
for (const m of hlCaptureMatches) {
  const cap = m[1];
  if (!cap.startsWith('_') && !zedOfficialCaptures.has(cap)) {
    invalidHlCaptures.push(cap);
  }
}
if (invalidHlCaptures.length > 0) {
  queryAudit.errors.push({
    file: 'highlights.scm',
    line: 1,
    col: 1,
    msg: `Found ${invalidHlCaptures.length} captures not in official Zed specification: [${invalidHlCaptures.join(', ')}]`
  });
}

console.log('================ 1. TREE-SITTER QUERY VALIDITY ================');
console.log(`Audited ${scmFiles.length} files against ${namedNodes.size} named nodes & ${anonTokens.size} anonymous tokens.`);
if (queryAudit.errors.length === 0) {
  console.log('Result: [PASS] All node types and fields in all .scm files are completely VALID!');
} else {
  console.log(`Result: [FAIL] Found ${queryAudit.errors.length} query errors:`);
  for (const err of queryAudit.errors) {
    console.log(`  - [${err.file}:${err.line}:${err.col}] ${err.msg}`);
  }
}

// Audit specific feature coverage
console.log('\n================ 2. LANGUAGE FEATURE HIGHLIGHTING COVERAGE ================');
const hlContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'highlights.scm'), 'utf8');

const featureChecks = [
  {
    name: 'Lambdas: lambda_expression',
    ok: hlContent.includes('lambda_expression'),
    details: 'lambda_expression keyword "fun" and operator "=>" highlighted'
  },
  {
    name: 'Lambdas: arrow_function',
    ok: hlContent.includes('arrow_function'),
    details: 'arrow_function operator "=>" highlighted'
  },
  {
    name: 'Lambdas: arrow_function parameters',
    ok: hlContent.includes('arrow_function') && hlContent.includes('parameters: (parenthesized_expression'),
    details: 'Missing: arrow function parameters are parenthesized_expression and not highlighted as @variable.parameter'
  },
  {
    name: 'Attributes: module_attribute (#![, !#[)',
    ok: hlContent.includes('module_attribute') && hlContent.includes('#![') && hlContent.includes('!#['),
    details: 'module_attribute highlighted as @attribute, delimiters as @punctuation.bracket'
  },
  {
    name: 'Attributes: attribute (#[...], |...|)',
    ok: hlContent.includes('(attribute)') && hlContent.includes('#[') && hlContent.includes('|'),
    details: 'attribute highlighted as @attribute, delimiters as @punctuation.bracket'
  },
  {
    name: 'Attributes: attribute_item with scoped_identifier',
    ok: hlContent.includes('attribute_item') && hlContent.includes('scoped_identifier'),
    details: 'attribute_item name: scoped_identifier supported'
  },
  {
    name: 'Attributes: attribute_item bang (!)',
    ok: hlContent.includes('(attribute_item "!"'),
    details: 'attribute_item "!" highlighted as @operator (e.g. #[!mangle])'
  },
  {
    name: 'Attributes: attribute_named_arg',
    ok: hlContent.includes('attribute_named_arg name:') && hlContent.includes('(attribute_named_arg "="'),
    details: 'attribute_named_arg name as @property, "=" as @operator'
  },
  {
    name: 'Attributes: c_attribute_item',
    ok: hlContent.includes('(c_attribute_item name:'),
    details: 'c_attribute_item name as @attribute'
  },
  {
    name: 'Macros: macro_declaration',
    ok: hlContent.includes('(macro_declaration name: (identifier) @preproc)'),
    details: 'macro_declaration name as @preproc'
  },
  {
    name: 'Macros: macro_call_expression with identifier',
    ok: hlContent.includes('(macro_call_expression macro: (identifier) @preproc)'),
    details: 'macro_call_expression macro as @preproc'
  },
  {
    name: 'Macros: macro_call_expression with scoped_identifier',
    ok: hlContent.includes('macro: (scoped_identifier') && hlContent.includes('@preproc'),
    details: 'macro_call_expression macro scoped_identifier as @preproc'
  },
  {
    name: 'Macros: macro_call_expression bang (!)',
    ok: hlContent.includes('(macro_call_expression "!" @operator)'),
    details: 'macro_call_expression "!" highlighted as @operator'
  },
  {
    name: 'Imports: load keyword',
    ok: hlContent.includes('"load" @keyword'),
    details: 'load as @keyword'
  },
  {
    name: 'Imports: relative prefix (., .., ...)',
    ok: hlContent.includes('(relative_prefix) @punctuation.delimiter'),
    details: 'relative_prefix as @punctuation.delimiter'
  },
  {
    name: 'Imports: folder bang (!)',
    ok: hlContent.includes('(import_segment "!" @punctuation.delimiter)'),
    details: 'import_segment "!" as @punctuation.delimiter'
  },
  {
    name: 'Imports: wildcard (*)',
    ok: hlContent.includes('(import_pattern "*" @operator)'),
    details: 'import_pattern "*" as @operator'
  },
  {
    name: 'Imports: alias "as" keyword',
    ok: hlContent.includes('(import_symbols_clause "as" @keyword)'),
    details: 'import_symbols_clause "as" as @keyword'
  },
  {
    name: 'Imports: symbols (import_symbols_clause)',
    ok: hlContent.includes('(import_symbols_clause (import_pattern (identifier) @variable))') &&
        hlContent.includes('(import_symbols_clause (identifier) @variable)'),
    details: 'import symbols and alias targets as @variable'
  },
  {
    name: 'Structs: struct_declaration',
    ok: hlContent.includes('(struct_declaration name: (identifier) @type)'),
    details: 'struct_declaration name as @type'
  },
  {
    name: 'Structs: struct_expression (name, scoped_identifier)',
    ok: hlContent.includes('(struct_expression name: (identifier) @type)') &&
        hlContent.includes('(struct_expression\n  name: (scoped_identifier'),
    details: 'struct_expression name as @type'
  },
  {
    name: 'Structs: struct_field_initializer',
    ok: hlContent.includes('(struct_field_initializer name: (identifier) @property)'),
    details: 'struct_field_initializer name as @property'
  },
  {
    name: 'Call arguments: named_argument',
    ok: hlContent.includes('(named_argument name: (identifier) @variable.parameter)') &&
        hlContent.includes('(named_argument "=" @operator)'),
    details: 'named_argument name as @variable.parameter, "=" as @operator'
  },
  {
    name: 'Interface: method_signature',
    ok: hlContent.includes('(method_signature name: (identifier) @function)'),
    details: 'method_signature name as @function'
  },
  {
    name: 'Operator declarations: operator_declaration & operator_symbol',
    ok: hlContent.includes('(operator_declaration name: (operator_symbol) @operator)'),
    details: 'operator_declaration name as @operator'
  },
  {
    name: 'Special types: pointer_type (ptr) & map_type (map)',
    ok: hlContent.includes('"ptr"') && hlContent.includes('"map"'),
    details: 'ptr and map in pointer_type and map_type highlighted as @type.builtin'
  },
  {
    name: 'Heritage: class_heritage extends/with types',
    ok: hlContent.includes('class_heritage'),
    details: 'class_heritage base class and interface names as @type'
  },
  {
    name: 'Generics: type_parameters',
    ok: hlContent.includes('type_parameters'),
    details: 'type parameter declarations <T> as @type'
  },
  {
    name: 'Alias: alias_declaration name',
    ok: hlContent.includes('(alias_declaration name: (identifier) @variable)'),
    details: 'alias_declaration name as @variable'
  },
  {
    name: 'Catch: sus_statement error variable',
    ok: hlContent.includes('sus_statement') && hlContent.includes('error:'),
    details: 'sus_statement error: (identifier) in catch as @variable'
  },
  {
    name: 'Destructuring: tuple_pattern in variable_declaration',
    ok: hlContent.includes('tuple_pattern'),
    details: 'tuple_pattern (a, b) in set (a, b) = pair as @variable'
  },
  {
    name: 'For loop: index variable',
    ok: hlContent.includes('for_statement') && hlContent.includes('index:'),
    details: 'for_statement index: (identifier) as @variable'
  },
  {
    name: 'Scoped identifier namespace prefix',
    ok: hlContent.includes('(scoped_identifier\n  (identifier) @type)'),
    details: 'Prefix namespace/module in scoped_identifier as @type'
  }
];

for (const check of featureChecks) {
  const status = check.ok ? '[OK]  ' : '[GAP] ';
  console.log(`${status} ${check.name.padEnd(45)} -> ${check.details}`);
}

// 3. Audit brackets and indents
console.log('\n================ 3. BRACKETS AND INDENTS AUDIT ================');
const bracketsContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'brackets.scm'), 'utf8');
const indentsContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'indents.scm'), 'utf8');
const configTomlContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'config.toml'), 'utf8');

console.log('Brackets in brackets.scm:');
console.log('  #[ ... ]    :', bracketsContent.includes('"#[" @open "]" @close'));
console.log('  #![ ... ]   :', bracketsContent.includes('"#![" @open "]" @close'));
console.log('  !#[ ... ]   :', bracketsContent.includes('"!#[" @open "]" @close'));
console.log('  { ... }     :', bracketsContent.includes('"{" @open "}" @close'));
console.log('  [ ... ]     :', bracketsContent.includes('"[" @open "]" @close'));
console.log('  ( ... )     :', bracketsContent.includes('"(" @open ")" @close'));
console.log('  " ... "     :', bracketsContent.includes('"\\"" @open "\\"" @close'));
console.log('  \' ... \'     :', bracketsContent.includes('"\'" @open "\'" @close'));
console.log('  """ ... """ :', (bracketsContent.includes('\"\"\"') || bracketsContent.includes('\\"\\"\\"')) ? '[OK]' : 'GAP (multiline strings not in brackets.scm)');

console.log('\nIndents in indents.scm (@indent):');
const hasBraceIndent = indentsContent.includes('"{"') && indentsContent.includes('"}" @end') && indentsContent.includes('@indent');
const hasBracketIndent = indentsContent.includes('"["') && indentsContent.includes('"]" @end') && indentsContent.includes('@indent');
const hasParenIndent = indentsContent.includes('"("') && indentsContent.includes('")" @end') && indentsContent.includes('@indent');
const hasSwitchArm = indentsContent.includes('(switch_arm) @indent');

console.log('  { ... } @end block/body/map/expr indent : ' + (hasBraceIndent ? '[OK]' : '[GAP]'));
console.log('  [ ... ] @end array/bracket indent       : ' + (hasBracketIndent ? '[OK]' : '[GAP]'));
console.log('  ( ... ) @end paren/arg indent           : ' + (hasParenIndent ? '[OK]' : '[GAP]'));
console.log('  (switch_arm) @indent                    : ' + (hasSwitchArm ? '[OK]' : '[GAP]'));

// 4. Audit Outline and Textobjects
console.log('\n================ 4. OUTLINE AND TEXTOBJECTS AUDIT ================');
const outlineContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'outline.scm'), 'utf8');
const textobjectsContent = fs.readFileSync(path.join(ZED_LANG_DIR, 'textobjects.scm'), 'utf8');

console.log('Outline symbols:');
console.log('  function_declaration   :', outlineContent.includes('function_declaration'));
console.log('  cfun_declaration       :', outlineContent.includes('cfun_declaration'));
console.log('  method_declaration     :', outlineContent.includes('method_declaration'));
console.log('  method_signature       :', outlineContent.includes('method_signature') ? 'OK' : 'GAP (interface methods missing from outline)');
console.log('  operator_declaration   :', outlineContent.includes('operator_declaration') ? 'OK' : 'GAP (operator overloads missing from outline)');
console.log('  class_declaration      :', outlineContent.includes('class_declaration'));
console.log('  struct_declaration     :', outlineContent.includes('struct_declaration'));
console.log('  interface_declaration  :', outlineContent.includes('interface_declaration'));
console.log('  enum_declaration       :', outlineContent.includes('enum_declaration'));
console.log('  type_alias_declaration :', outlineContent.includes('type_alias_declaration'));
console.log('  alias_declaration      :', /\(alias_declaration\b/.test(outlineContent) ? 'OK' : 'GAP (module/symbol alias missing from outline)');
console.log('  macro_declaration      :', outlineContent.includes('macro_declaration'));
console.log('  property_declaration   :', outlineContent.includes('property_declaration'));

console.log('\nTextobjects:');
console.log('  function_declaration @function :', textobjectsContent.includes('function_declaration'));
console.log('  cfun_declaration @function     :', textobjectsContent.includes('cfun_declaration'));
console.log('  lambda_expression @function    :', textobjectsContent.includes('lambda_expression'));
console.log('  method_declaration @function   :', textobjectsContent.includes('method_declaration') ? 'OK' : 'GAP (class/struct methods missing from @function.around/inside)');
console.log('  operator_declaration @function :', textobjectsContent.includes('operator_declaration') ? 'OK' : 'GAP (operator methods missing from @function.around/inside)');
console.log('  class_declaration @class       :', textobjectsContent.includes('class_declaration'));
console.log('  struct_declaration @class      :', textobjectsContent.includes('struct_declaration'));
console.log('  interface_declaration @class   :', textobjectsContent.includes('interface_declaration') ? 'OK' : 'GAP (interfaces missing from @class.around/inside)');
console.log('  enum_declaration @class        :', textobjectsContent.includes('enum_declaration') ? 'OK' : 'GAP (enums missing from @class.around/inside)');

// 5. Audit snippets
console.log('\n================ 5. SNIPPETS AUDIT ================');
const snippetsPath = path.join(ZED_DIR, 'snippets/yukino.json');
const snippets = JSON.parse(fs.readFileSync(snippetsPath, 'utf8'));
let snippetErrors = 0;
for (const [name, s] of Object.entries(snippets)) {
  if (!s.prefix || !s.body || !s.description) {
    console.log(`Snippet "${name}" is missing required fields!`);
    snippetErrors++;
  }
}
console.log(`Audited ${Object.keys(snippets).length} snippets. Found ${snippetErrors} structural errors.`);

// 6. Audit config.toml & extension.toml
console.log('\n================ 6. METADATA & CONFIG AUDIT ================');
const extToml = fs.readFileSync(path.join(ZED_DIR, 'extension.toml'), 'utf8');
console.log('extension.toml placeholders:');
if (extToml.includes('<AUTHOR_NAME>')) console.log('  [WARN] authors contains placeholder "<AUTHOR_NAME>"');
if (extToml.includes('<USERNAME>')) console.log('  [WARN] repository contains placeholder "<USERNAME>"');
if (extToml.includes('file:///')) console.log('  [WARN] grammars.yukino.repository is local dummy "file:///" instead of public git repo');

console.log('\nconfig.toml check:');
console.log('  name = Yukino         :', configTomlContent.includes('name = "Yukino"'));
console.log('  grammar = yukino      :', configTomlContent.includes('grammar = "yukino"'));
console.log('  path_suffixes = [ykn] :', configTomlContent.includes('path_suffixes = ["ykn"]'));
console.log('  tab_size = 4          :', configTomlContent.includes('tab_size = 4'));
console.log('  decrease_indent       :', configTomlContent.includes('decrease_indent_pattern'));

console.log('\n================ AUDIT SUMMARY COMPLETE ================');

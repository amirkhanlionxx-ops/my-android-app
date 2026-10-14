// Canonical Paired Symbols - Guaranteed vertical alignment across all columns
export const CANONICAL_SYMBOL_PAIRS: [string, string][] = [
  // Primary openers and closers
  ['\\n', 'Tab'],
  ['{', '}'],
  ['(', ')'],
  ['[', ']'],
  ['<', '>'],
  ['"', "'"],
  ['=', ';'],
  ['+', '-'],
  ['*', '/'],
  [':', ','],
  ['.', '_'],
  ['!', '?'],
  ['&', '|'],
  ['%', '$'],
  ['@', '#'],
  ['\\', '~'],
  ['^', '␣'],
  // Compound operators
  ['==', '!='],
  ['===', '!=='],
  ['<=', '>='],
  ['&&', '||'],
  ['++', '--'],
  ['+=', '-='],
  ['*=', '/='],
  ['->', '=>'],
  ['?.', '?:'],
  ['::', '..'],
  ['<<', '>>'],
  ['/*', '*/'],
  ['//', '///'],
  ['<!--', '-->'],
  ['<>', '</>'],
  ['${}', '#{}'],
  ['()', '[]'],
  ['{}', '<>'],
  ['""', "''"],
  ['``', '$()'],
  // Arrows & Connectors
  ['→', '←'],
  ['↑', '↓'],
  ['⇒', '⇐'],
  ['-->', '<--'],
  ['==>', '<=='],
  ['⋯', '⋮'],
  // Regex & Escapes
  ['\\d', '\\D'],
  ['\\w', '\\W'],
  ['\\s', '\\S'],
  ['\\b', '\\B'],
  ['\\t', '\\r'],
  ['[A-Z]', '[a-z]'],
  ['[0-9]', '[^ ]'],
  // Math & Science
  ['±', '∓'],
  ['×', '÷'],
  ['≤', '≥'],
  ['≠', '≈'],
  ['√', '∞'],
  ['∑', '∏'],
  ['π', 'λ'],
  // Punctuation & Currency
  ['«', '»'],
  ['“', '”'],
  ['‘', '’'],
  ['©', '®'],
  ['€', '¥'],
  // Core Language Keywords
  ['val', 'var'],
  ['let', 'const'],
  ['fun', 'class'],
  ['fn', 'struct'],
  ['if', 'else'],
  ['for', 'while'],
  ['true', 'false'],
  ['try', 'catch'],
  ['async', 'await'],
  ['return', 'yield'],
  ['public', 'private'],
  ['protected', 'internal'],
  ['package', 'import'],
  ['extends', 'implements'],
  ['this', 'super'],
  ['null', 'void'],
  ['print()', 'println()'],
  ['console.log()', 'Log.d()'],
  // UI & App Component Tokens
  ['TopBar', 'BottomBar'],
  ['Header', 'Footer'],
  ['SearchBar', 'CoinBalance'],
  ['Drawer', 'Sidebar'],
  ['TabBar', 'NavBar'],
  ['Row', 'Column'],
  ['CardView', 'Container'],
  ['Button', 'FloatingBtn'],
  ['Text', 'Icon'],
  ['Image', 'Box'],
  ['Scaffold', 'Widget'],
  ['StatefulWidget', 'StatelessWidget'],
  ['useState()', 'useEffect()'],
  ['@Composable', 'Modifier'],
  ['Spacer', 'ActionMenu'],
  ['build()', 'setState()']
];

export const DEFAULT_ROW1_SYMBOLS = CANONICAL_SYMBOL_PAIRS.map(p => p[0]);
export const DEFAULT_ROW2_SYMBOLS = CANONICAL_SYMBOL_PAIRS.map(p => p[1]);

export const UI_TOKEN_SET = new Set([
  'TopBar', 'SearchBar', 'Drawer', 'TabBar', 'FloatingBtn', 'Header', 'CardView', 'Column', 'Text', 'Icon', 'Scaffold', 'StatefulWidget', 'BottomBar', 'CoinBalance', 'Sidebar', 'NavBar', 'ActionMenu', 'Footer', 'Container', 'Row', 'Button', 'Image', 'Widget', 'StatelessWidget', 'Box', 'Spacer'
]);

export const CODE_KEYWORD_SET = new Set([
  'fn', 'val', 'let', 'if', 'for', 'return', 'yield', 'class', 'struct', 'public', 'protected', 'void', 'true', 'this', 'try', 'async', 'extends', 'package', 'print()', 'println()', 'console.log()', 'Log.d()', 'fun', 'var', 'const', 'else', 'while', 'false', 'super', 'catch', 'await', 'private', 'internal', 'import', 'implements', 'null', 'build()', 'setState()', 'useState()', 'useEffect()', '@Composable', 'Modifier'
]);

// Guaranteed 1-to-1 vertical matches in primary coding columns
export const alignSymbolPairs = (r1: string[], r2: string[]): [string[], string[]] => {
  // If lengths or symbols don't match canonical set, return pristine canonical arrays
  if (!r1 || !r2 || r1.length === 0 || r2.length === 0) {
    return [DEFAULT_ROW1_SYMBOLS, DEFAULT_ROW2_SYMBOLS];
  }

  const row1 = [...r1];
  const row2 = [...r2];

  CANONICAL_SYMBOL_PAIRS.forEach(([top, bottom], idx) => {
    const topIdx = row1.indexOf(top);
    if (topIdx !== -1 && topIdx !== idx) {
      row1.splice(topIdx, 1);
      row1.splice(idx, 0, top);
    }
    const bottomIdx = row2.indexOf(bottom);
    if (bottomIdx !== -1 && bottomIdx !== idx) {
      row2.splice(bottomIdx, 1);
      row2.splice(idx, 0, bottom);
    }
  });

  return [row1, row2];
};


import React from 'react';

const KEYWORDS = new Set([
  'fun', 'val', 'var', 'class', 'interface', 'object', 'override', 'private', 'public', 'protected',
  'internal', 'open', 'abstract', 'final', 'static', 'void', 'return', 'if', 'else', 'when', 'for',
  'while', 'do', 'break', 'continue', 'try', 'catch', 'finally', 'throw', 'import', 'package',
  'extends', 'implements', 'new', 'this', 'super', 'is', 'in', 'as', 'null', 'true', 'false',
  'function', 'const', 'let', 'async', 'await', 'export', 'default', 'from', 'typeof', 'instanceof',
  'switch', 'case', 'struct', 'enum', 'protocol', 'extension', 'some', 'guard', 'defer', 'late',
  'required', 'factory', 'get', 'set', 'operator', 'suspend', 'inline', 'data', 'sealed',
]);

const TYPES_AND_UI = new Set([
  'String', 'Int', 'Boolean', 'Double', 'Float', 'Long', 'Short', 'Byte', 'Char', 'Unit', 'Any',
  'List', 'Map', 'Set', 'Array', 'Bundle', 'Context', 'Intent', 'View', 'Activity', 'AppCompatActivity',
  'Fragment', 'TextView', 'Button', 'EditText', 'ImageView', 'LinearLayout', 'ConstraintLayout',
  'FrameLayout', 'RelativeLayout', 'RecyclerView', 'Toast', 'Log', 'Modifier', 'Column', 'Row',
  'Box', 'Text', 'Scaffold', 'TopAppBar', 'FloatingActionButton', 'Icon', 'Image', 'Card',
  'Container', 'Center', 'Padding', 'SizedBox', 'Expanded', 'StatefulWidget', 'StatelessWidget',
  'State', 'Widget', 'BuildContext', 'MaterialApp', 'ThemeData', 'Colors', 'EdgeInsets',
  'Document', 'Window', 'HTMLElement', 'Promise', 'Array', 'Object', 'Math', 'JSON', 'Date',
  'localStorage', 'document', 'window', 'console', 'navigator',
]);

// Combined single-pass tokenizer regex for fast, flicker-free line highlighting
const TOKEN_REGEX =
  /(<!--[\s\S]*?-->|\/\/.*$|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(<\/?[a-zA-Z0-9_:-]+|\/>|>)|(@[a-zA-Z0-9_]+)|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|dp|sp|rem|em|vh|vw|%|ms|s)?\b)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)(?=\s*\()|(\b[a-zA-Z_$][a-zA-Z0-9_$:-]*\b)(?=\s*=)|(\b[a-zA-Z_$][a-zA-Z0-9_$]*\b)/gm;

export function highlightSingleLine(line: string, lineIndex: number): React.ReactNode {
  if (!line) {
    return (
      <div key={lineIndex} className="syntax-line">
        {'\u00A0'}
      </div>
    );
  }

  const trimmed = line.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('<!--') || trimmed.startsWith('#')) {
    return (
      <div key={lineIndex} className="syntax-line" style={{ color: '#64748b', fontStyle: 'italic' }}>
        {line}
      </div>
    );
  }

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;

  let tokenKey = 0;
  while ((match = TOKEN_REGEX.exec(line)) !== null) {
    if (match.index > lastIndex) {
      elements.push(line.slice(lastIndex, match.index));
    }

    const full = match[0];
    const [
      ,
      comment,
      strLiteral,
      htmlTag,
      annotation,
      numOrColor,
      funcCall,
      attrName,
      ident,
    ] = match;

    if (comment) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#64748b', fontStyle: 'italic' }}>
          {full}
        </span>
      );
    } else if (strLiteral) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#4ade80' }}>
          {full}
        </span>
      );
    } else if (htmlTag) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#fb7185', fontWeight: 600 }}>
          {full}
        </span>
      );
    } else if (annotation) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#f472b6', fontWeight: 600 }}>
          {full}
        </span>
      );
    } else if (numOrColor) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#fbbf24' }}>
          {full}
        </span>
      );
    } else if (funcCall) {
      if (KEYWORDS.has(funcCall)) {
        elements.push(
          <span key={tokenKey++} style={{ color: '#c084fc', fontWeight: 600 }}>
            {full}
          </span>
        );
      } else {
        elements.push(
          <span key={tokenKey++} style={{ color: '#38bdf8' }}>
            {full}
          </span>
        );
      }
    } else if (attrName) {
      elements.push(
        <span key={tokenKey++} style={{ color: '#7dd3fc' }}>
          {full}
        </span>
      );
    } else if (ident) {
      if (KEYWORDS.has(ident)) {
        elements.push(
          <span key={tokenKey++} style={{ color: '#c084fc', fontWeight: 600 }}>
            {full}
          </span>
        );
      } else if (TYPES_AND_UI.has(ident) || /^[A-Z]/.test(ident)) {
        elements.push(
          <span key={tokenKey++} style={{ color: '#2dd4bf' }}>
            {full}
          </span>
        );
      } else {
        elements.push(
          <span key={tokenKey++} style={{ color: '#e2e8f0' }}>
            {full}
          </span>
        );
      }
    } else {
      elements.push(full);
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < line.length) {
    elements.push(line.slice(lastIndex));
  }

  return (
    <div key={lineIndex} className="syntax-line">
      {elements}
    </div>
  );
}

export function renderHighlightedLines(code: string): React.ReactNode {
  const lines = (code || '').split('\n');
  return lines.map((line, idx) => highlightSingleLine(line, idx));
}

// Static scope check: flags identifiers that are read but never declared anywhere.
var acorn = require('acorn'), walk = require('acorn-walk'), fs = require('fs');
var code = fs.readFileSync(process.argv[2], 'utf8');
var ast = acorn.parse(code, { ecmaVersion: 2020, sourceType: 'script', locations: true });
var declared = {};
walk.full(ast, function (n) {
  if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier') declared[n.id.name] = 1;
  if ((n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression') && n.id) declared[n.id.name] = 1;
  if (n.type === 'FunctionDeclaration' || n.type === 'FunctionExpression' || n.type === 'ArrowFunctionExpression') n.params.forEach(function (p) { if (p.type === 'Identifier') declared[p.name] = 1; });
  if (n.type === 'CatchClause' && n.param) declared[n.param.name] = 1;
});
var globals = 'window document localStorage console Math JSON Date Promise setTimeout clearTimeout Object Array String Number Infinity NaN isNaN parseInt module require undefined Error Symbol arguments navigator Boolean Path2D atob Uint8Array URL Blob'.split(' ');
globals.forEach(function (g) { declared[g] = 1; });
var bad = {};
walk.ancestor(ast, {
  Identifier: function (n, anc) {
    var p = anc[anc.length - 2];
    if (p && p.type === 'MemberExpression' && p.property === n && !p.computed) return;
    if (p && p.type === 'Property' && p.key === n && !p.computed && p.value !== n) return;
    if (p && p.type === 'Property' && p.key === n && p.shorthand) { /* fallthrough */ }
    if (!declared[n.name]) bad[n.name] = (bad[n.name] || []).concat(n.loc.start.line);
  }
});
var keys = Object.keys(bad);
if (keys.length) { keys.forEach(function (k) { console.log('UNDECLARED ' + k + ' at lines ' + bad[k].slice(0, 5).join(',')); }); process.exit(1); }
// let/const at top level are banned by convention
var topLet = ast.body.some(function (n) { return n.type === 'VariableDeclaration' && n.kind !== 'var'; });
var anyLet = 0; walk.full(ast, function (n) { if (n.type === 'VariableDeclaration' && n.kind !== 'var') anyLet++; });
console.log('SCOPE OK (' + Object.keys(declared).length + ' names, let/const: ' + anyLet + ')');

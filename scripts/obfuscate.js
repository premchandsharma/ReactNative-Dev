// scripts/obfuscate.js
const fs = require('fs');
const path = require('path');
const {minify} = require('terser');

const isPublishing = process.env.NODE_ENV === 'production';

const libDir = path.join(__dirname, '..', 'lib');

const terserOptions = {
  mangle: {
    // More conservative variable name mangling
    reserved: [
      // Core module system - must preserve
      'require',
      'exports',
      'module',
      'Object',
      'defineProperty',
      'hasOwnProperty',
      'prototype',
      'constructor',
      // React Native essentials
      'React',
      'Native',
      'AppStorys', // Your library name
      'default',
      '_default',
      '_interopRequireDefault', // Critical for CommonJS imports
      '_interopRequireWildcard',
      '__esModule', // Critical - prevents mangling of __esModule property
      // Critical globals
      'global',
      'process',
      'Buffer',
      'console',
      'Error',
      'TypeError',
      'undefined',
      'null',
      // Common React Native bridge names
      'NativeModules',
      'Platform',
      'Dimensions',
      'AsyncStorage'
    ],
    keep_fnames: false, // Mangle function names
    toplevel: false, // Don't mangle top-level variables (safer for imports)
    properties: {
      // Very conservative property mangling
      reserved: [
        'require',
        'exports',
        'module',
        'default',
        'prototype',
        'constructor',
        'length',
        'name',
        'toString',
        'valueOf',
        'getItem',
        'setItem',
        'removeItem',
        '__esModule', // Also preserve as property
        // React/RN properties
        'render',
        'componentDidMount',
        'componentWillUnmount',
        'props',
        'state',
        'refs'
      ],
      regex: /^__/ // Don't mangle properties starting with double underscore
    }
  },
  compress: {
    // Much more conservative compression to preserve import structure
    arguments: false, // Don't optimize arguments
    arrows: true,
    booleans: true,
    booleans_as_integers: false,
    collapse_vars: false, // Don't collapse variables (can break imports)
    comparisons: true,
    computed_props: false, // Don't optimize computed properties
    conditionals: true,
    dead_code: true,
    directives: true,
    drop_console: false,
    drop_debugger: true,
    evaluate: false, // Don't evaluate expressions (can break imports)
    expression: false,
    hoist_funs: false, // Don't hoist functions
    hoist_props: false, // Don't hoist properties
    hoist_vars: false, // Don't hoist variables
    if_return: true,
    inline: false, // Don't inline functions (breaks _interopRequireDefault)
    join_vars: false, // Don't join variable declarations
    keep_fargs: true, // Keep function arguments
    keep_fnames: true, // Keep function names for debugging
    keep_infinity: true,
    loops: true,
    negate_iife: false,
    properties: false, // Don't optimize properties
    pure_getters: false, // Don't assume getters are pure
    pure_funcs: isPublishing ? ['console.log'] : [], // Only remove console.log in production
    reduce_funcs: false, // Don't reduce function calls
    reduce_vars: false, // Don't reduce variables (can break imports)
    sequences: true,
    side_effects: false, // Don't remove side effects
    switches: true,
    typeofs: true,
    unsafe: false,
    unsafe_arrows: false,
    unsafe_comps: false,
    unsafe_Function: false,
    unsafe_math: false,
    unsafe_proto: false,
    unsafe_regexp: false,
    unsafe_undefined: false,
    unused: false, // Don't remove unused code (can break imports)
    passes: 1 // Single pass only
  },
  format: {
    ascii_only: true,
    beautify: false,
    braces: false,
    comments: false,
    ecma: 2015,
    indent_level: 0,
    keep_quoted_props: true, // Keep quoted properties (safer)
    quote_keys: false,
    quote_style: 1,
    semicolons: true, // Keep semicolons for safety
    shebang: false,
    webkit: false,
    wrap_iife: false
  },
  sourceMap: false,
  ecma: 2015,
  keep_classnames: false,
  keep_fnames: true, // Keep function names for better debugging
  safari10: false,
  ie8: false
};

function walkDirectory(dir, callback) {
  if (!fs.existsSync(dir)) return;

  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDirectory(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

async function obfuscateJSFile(filePath) {
  if (!filePath.endsWith('.js') || filePath.includes('.d.ts')) return;

  try {
    const code = fs.readFileSync(filePath, 'utf8');

    // Skip empty files
    if (!code.trim()) {
      console.log('Skipped (empty):', path.relative(process.cwd(), filePath));
      return;
    }

    const result = await minify(code, terserOptions);

    if (result.error) {
      console.warn('Failed to obfuscate:', path.relative(process.cwd(), filePath), result.error);
      return;
    }

    if (!result.code) {
      console.log('Skipped (no output):', path.relative(process.cwd(), filePath));
      return;
    }

    fs.writeFileSync(filePath, result.code, 'utf8');
    console.log('Obfuscated:', path.relative(process.cwd(), filePath));
  } catch (error) {
    console.warn('Failed to obfuscate:', path.relative(process.cwd(), filePath), error.message);
  }
}

async function main() {
  console.log('Starting Terser-based obfuscation...');

  const files = [];
  walkDirectory(libDir, (filePath) => files.push(filePath));

  for (const file of files) {
    await obfuscateJSFile(file);
  }

  console.log('Obfuscation complete.');
}

main().catch(console.error);

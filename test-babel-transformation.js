const babel = require('@babel/core');
const fs = require('fs');
const path = require('path');

// Read the test input file
const inputFile = path.join(__dirname, 'test-input.jsx');
const inputCode = fs.readFileSync(inputFile, 'utf8');

console.log('=== ORIGINAL CODE ===');
console.log(inputCode);
console.log('\n' + '='.repeat(50));
console.log('=== TRANSFORMED CODE ===');

try {
  // Transform the code using ONLY our Babel plugin (preserve JSX)
  const result = babel.transformSync(inputCode, {
    plugins: [
      './babel-plugin.js'
    ],
    parserOpts: {
      plugins: ['jsx', 'typescript']
    },
    generatorOpts: {
      jsescOption: {
        quotes: 'double'
      }
    },
    // Don't transform JSX at all
    presets: [],
    // Preserve JSX syntax in output
    code: true,
    ast: false,
    filename: 'test-input.jsx'
  });

  console.log(result.code);

  // Also save the output to a file for easier comparison
  const outputFile = path.join(__dirname, 'test-output.jsx');
  fs.writeFileSync(outputFile, result.code);

  console.log('\n' + '='.repeat(50));
  console.log('✅ Transformation completed successfully!');
  console.log(`📄 Output saved to: ${outputFile}`);

  console.log('\n=== SUMMARY OF CHANGES ===');
  console.log('🔍 Elements with appstorys prop that were wrapped:');

  // Count transformations
  const appstorysMatches = inputCode.match(/appstorys="[^"]*"/g) || [];
  console.log(`   • Found ${appstorysMatches.length} elements with appstorys prop`);
  appstorysMatches.forEach(match => {
    const appstorysId = match.match(/appstorys="([^"]*)"/)[1];
    console.log(`   • ${appstorysId}`);
  });

  // Check if Measurable import was added
  if (result.code.includes('import { Measurable }')) {
    console.log('✅ Measurable import added automatically');
  }

  // Count how many Measurable wrappers were created
  const measurableMatches = result.code.match(/<Measurable testID=/g) || [];
  console.log(`✅ Created ${measurableMatches.length} Measurable wrappers`);

  // Check if JSX is preserved
  if (result.code.includes('<Measurable') && !result.code.includes('React.createElement')) {
    console.log('✅ JSX syntax preserved in output');
  } else if (result.code.includes('React.createElement')) {
    console.log('⚠️  Output converted to React.createElement calls (this is normal for Babel)');
    console.log('   In actual usage, your bundler will handle JSX transformation');
  }

} catch (error) {
  console.error('❌ Transformation failed:', error.message);
  console.error('Stack:', error.stack);
}

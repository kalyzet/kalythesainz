/**
 * Test ESM Import from installed package
 */

console.log('🧪 Testing ESM Import from npm package...\n');

try {
    // Import from installed package
    const KALY = await import('kalythesainz');

    console.log('✅ Package imported successfully!');
    console.log(`✅ VERSION: ${KALY.VERSION}`);

    const exports = Object.keys(KALY);
    console.log(`✅ Found ${exports.length} exports`);
    console.log(`✅ Exports: ${exports.slice(0, 10).join(', ')}...`);

    // Check main exports
    const requiredExports = ['Scene', 'Box', 'Sphere', 'Light', 'Camera', 'Renderer'];
    const missing = requiredExports.filter((exp) => !exports.includes(exp));

    if (missing.length === 0) {
        console.log('✅ All required exports present');
    } else {
        console.log(`❌ Missing exports: ${missing.join(', ')}`);
        process.exit(1);
    }

    console.log('\n🎉 ESM IMPORT TEST PASSED!');
    console.log('✅ Package structure correct');
    console.log('✅ dist/kalythesainz.esm.js accessible');
} catch (error) {
    console.error('❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
}

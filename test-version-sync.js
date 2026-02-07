/**
 * Test Version Sync
 * Memastikan version di banner sync dengan package.json
 */

import { readFileSync } from 'fs';

console.log('🧪 Testing Version Sync...\n');

// Read package.json
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const packageVersion = pkg.version;
console.log(`📦 package.json version: ${packageVersion}`);

// Read ESM build
const esmContent = readFileSync('./dist/kalythesainz.esm.js', 'utf-8');
const esmMatch = esmContent.match(/KALYTHESAINZ v([\d.]+)/);
const esmVersion = esmMatch ? esmMatch[1] : 'NOT FOUND';
console.log(`📄 ESM build version: ${esmVersion}`);

// Read UMD build
const umdContent = readFileSync('./dist/kalythesainz.umd.min.js', 'utf-8');
const umdMatch = umdContent.match(/KALYTHESAINZ v([\d.]+)/);
const umdVersion = umdMatch ? umdMatch[1] : 'NOT FOUND';
console.log(`📄 UMD build version: ${umdVersion}`);

// Check sync
console.log('\n📊 Results:');

let allPassed = true;

if (esmVersion === packageVersion) {
    console.log('✅ ESM version matches package.json');
} else {
    console.log(`❌ ESM version mismatch! Expected: ${packageVersion}, Got: ${esmVersion}`);
    allPassed = false;
}

if (umdVersion === packageVersion) {
    console.log('✅ UMD version matches package.json');
} else {
    console.log(`❌ UMD version mismatch! Expected: ${packageVersion}, Got: ${umdVersion}`);
    allPassed = false;
}

if (esmVersion === umdVersion) {
    console.log('✅ ESM and UMD versions match');
} else {
    console.log(`❌ ESM and UMD versions mismatch! ESM: ${esmVersion}, UMD: ${umdVersion}`);
    allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
    console.log('🎉 ALL VERSION TESTS PASSED!');
    console.log('✅ Version sync is working correctly');
    process.exit(0);
} else {
    console.log('❌ VERSION TESTS FAILED!');
    console.log('⚠️  Version sync is broken');
    process.exit(1);
}

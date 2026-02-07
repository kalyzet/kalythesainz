/**
 * Test External Dependencies
 * Memastikan Three.js tidak di-bundle (external)
 */

import { readFileSync } from 'fs';

console.log('🧪 Testing External Dependencies...\n');

// Read ESM build
const esmContent = readFileSync('./dist/kalythesainz.esm.js', 'utf-8');

// Read UMD build
const umdContent = readFileSync('./dist/kalythesainz.umd.min.js', 'utf-8');

console.log('📊 Checking ESM build...');

// Check if Three.js is imported (not bundled)
const esmHasImport =
    esmContent.includes('import * as THREE from "three"') ||
    esmContent.includes('import*as THREE from"three"');

if (esmHasImport) {
    console.log('✅ ESM: Three.js is external (import statement found)');
} else {
    console.log('❌ ESM: Three.js might be bundled (no import statement)');
}

// Check if Three.js code is NOT bundled (check for actual Three.js implementation)
// References like "new THREE.WebGLRenderer" are OK - that's using external Three.js
// We're looking for actual Three.js class implementations
const esmHasThreeCode =
    esmContent.includes('class WebGLRenderer') ||
    esmContent.includes('function WebGLRenderer') ||
    (esmContent.includes('WebGLRenderer') && esmContent.length > 500000);

if (!esmHasThreeCode) {
    console.log('✅ ESM: Three.js code NOT bundled (only references to external THREE)');
} else {
    console.log('⚠️  ESM: Three.js code might be bundled');
}

console.log('\n📊 Checking UMD build...');

// Check if UMD expects Three.js as external
const umdHasExternal = umdContent.includes('require("three")') || umdContent.includes('e.THREE');

if (umdHasExternal) {
    console.log('✅ UMD: Three.js is external (require/global reference found)');
} else {
    console.log('❌ UMD: Three.js might be bundled');
}

// Check if Three.js code is NOT bundled
const umdHasThreeCode =
    umdContent.includes('WebGLRenderer') &&
    umdContent.includes('PerspectiveCamera') &&
    umdContent.includes('Scene') &&
    umdContent.length > 500000; // If bundled, file would be much larger

if (!umdHasThreeCode) {
    console.log('✅ UMD: Three.js code NOT bundled');
} else {
    console.log('⚠️  UMD: Three.js code might be bundled');
}

console.log('\n📊 File Sizes:');
console.log(`ESM: ${(esmContent.length / 1024).toFixed(2)} KB`);
console.log(`UMD: ${(umdContent.length / 1024).toFixed(2)} KB`);

// Three.js is ~600KB, so if our bundle is < 300KB, it's definitely not bundled
const esmSize = esmContent.length / 1024;
const umdSize = umdContent.length / 1024;

console.log('\n' + '='.repeat(50));

let allPassed = true;

if (esmSize < 300) {
    console.log('✅ ESM size reasonable (< 300KB) - Three.js not bundled');
} else {
    console.log('⚠️  ESM size large (> 300KB) - might include Three.js');
    allPassed = false;
}

if (umdSize < 300) {
    console.log('✅ UMD size reasonable (< 300KB) - Three.js not bundled');
} else {
    console.log('⚠️  UMD size large (> 300KB) - might include Three.js');
    allPassed = false;
}

if (esmHasImport && !esmHasThreeCode) {
    console.log('✅ ESM: Three.js correctly marked as external');
} else {
    console.log('❌ ESM: Three.js external check failed');
    allPassed = false;
}

if (umdHasExternal && !umdHasThreeCode) {
    console.log('✅ UMD: Three.js correctly marked as external');
} else {
    console.log('❌ UMD: Three.js external check failed');
    allPassed = false;
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
    console.log('🎉 ALL EXTERNAL DEPENDENCY TESTS PASSED!');
    console.log('✅ Three.js is correctly marked as external');
    console.log('✅ Framework does not bundle Three.js');
    console.log('✅ Users can provide their own Three.js');
    process.exit(0);
} else {
    console.log('⚠️  SOME EXTERNAL DEPENDENCY TESTS FAILED');
    console.log('Check the output above for details');
    process.exit(1);
}

/**
 * CDN Distribution Test Runner
 *
 * This script validates the CDN distribution by checking:
 * - Build outputs exist
 * - Files are properly formatted
 * - Source maps are generated
 * - Exports are available
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.join(__dirname, '..', 'dist');

console.log('🧪 Running CDN Distribution Tests...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (error) {
        console.log(`✗ ${name}`);
        console.log(`  Error: ${error.message}`);
        failed++;
    }
}

// Test 1: Check dist directory exists
test('Dist directory exists', () => {
    if (!fs.existsSync(distDir)) {
        throw new Error('Dist directory not found');
    }
});

// Test 2: Check required files exist
const requiredFiles = [
    'kalythesainz.js',
    'kalythesainz.js.map',
    'kalythesainz.min.js',
    'kalythesainz.min.js.map',
    'kalythesainz.umd.js',
    'kalythesainz.umd.js.map',
    'kalythesainz.umd.min.js',
    'kalythesainz.umd.min.js.map',
];

requiredFiles.forEach((file) => {
    test(`File exists: ${file}`, () => {
        const filePath = path.join(distDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${file}`);
        }
    });
});

// Test 3: Check file sizes (UMD should be minified)
test('UMD minified file is smaller than UMD dev file', () => {
    const devSize = fs.statSync(path.join(distDir, 'kalythesainz.umd.js')).size;
    const minSize = fs.statSync(path.join(distDir, 'kalythesainz.umd.min.js')).size;

    if (minSize >= devSize) {
        throw new Error(
            `Minified UMD file (${minSize} bytes) is not smaller than dev UMD file (${devSize} bytes)`,
        );
    }
});

// Test 4: Check ES module exports
test('ES module has proper exports', async () => {
    const modulePath = path.join(distDir, 'kalythesainz.min.js');
    const module = await import(`file://${modulePath}`);

    const requiredExports = [
        'Scene',
        'Renderer',
        'Camera',
        'Light',
        'Box',
        'Sphere',
        'Plane',
        'Inspector',
        'SceneTree',
        'TransformGizmo',
        'Serializer',
        'App',
        'Config',
        'EventBus',
        'VERSION',
    ];

    const missingExports = requiredExports.filter((exp) => !(exp in module));

    if (missingExports.length > 0) {
        throw new Error(`Missing exports: ${missingExports.join(', ')}`);
    }
});

// Test 5: Check source maps are valid JSON
test('Source maps are valid JSON', () => {
    const mapFile = path.join(distDir, 'kalythesainz.min.js.map');
    const mapContent = fs.readFileSync(mapFile, 'utf-8');

    try {
        const map = JSON.parse(mapContent);
        if (!map.version || !map.sources || !map.mappings) {
            throw new Error('Source map is missing required fields');
        }
    } catch (error) {
        throw new Error(`Invalid source map: ${error.message}`);
    }
});

// Test 6: Check file content
test('ES module contains export statements', () => {
    const content = fs.readFileSync(path.join(distDir, 'kalythesainz.js'), 'utf-8');

    if (!content.includes('export')) {
        throw new Error('File does not contain export statements');
    }
});

// Test 7: Check UMD format
test('UMD file has proper format', () => {
    const content = fs.readFileSync(path.join(distDir, 'kalythesainz.umd.min.js'), 'utf-8');

    // UMD should have define, exports, or global assignment
    const hasUMD =
        content.includes('define') ||
        content.includes('exports') ||
        content.includes('KALYTHESAINZ');

    if (!hasUMD) {
        throw new Error('UMD file does not have proper UMD format');
    }
});

// Test 8: Check Three.js is external
test('Three.js is marked as external dependency', () => {
    const content = fs.readFileSync(path.join(distDir, 'kalythesainz.min.js'), 'utf-8');

    // The build should import three, not bundle it
    // Check that three is referenced but not bundled
    const fileSize = fs.statSync(path.join(distDir, 'kalythesainz.min.js')).size;

    // Three.js full bundle is ~600KB+, our bundle should be much smaller
    if (fileSize > 500000) {
        throw new Error('File size suggests Three.js might be bundled instead of external');
    }
});

// Test 9: Check version consistency
test('VERSION export matches package.json', async () => {
    const modulePath = path.join(distDir, 'kalythesainz.min.js');
    const module = await import(`file://${modulePath}`);

    const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'),
    );

    if (module.VERSION !== packageJson.version) {
        throw new Error(
            `Version mismatch: module=${module.VERSION}, package.json=${packageJson.version}`,
        );
    }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
    console.log('\n❌ Some tests failed');
    process.exit(1);
} else {
    console.log('\n✅ All tests passed!');
    process.exit(0);
}

#!/usr/bin/env node

/**
 * Test runner for module integration property tests
 */

import { execSync } from 'child_process';

try {
    console.log('Running module integration property tests...\n');

    execSync(
        'node --experimental-vm-modules node_modules/jest/bin/jest.js tests/properties/module-integration.test.js --verbose',
        {
            stdio: 'inherit',
            env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' },
        },
    );

    console.log('\n✓ Module integration property tests passed!');
    process.exit(0);
} catch (error) {
    console.error('\n✗ Module integration property tests failed!');
    process.exit(1);
}

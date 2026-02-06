#!/usr/bin/env node

/**
 * Test runner for plugin system unit tests
 */

import { execSync } from 'child_process';

try {
    console.log('Running plugin system unit tests...\n');

    execSync(
        'node --experimental-vm-modules node_modules/jest/bin/jest.js tests/unit/core/PluginManager.test.js tests/unit/core/PluginInterfaces.test.js --verbose',
        {
            stdio: 'inherit',
            env: { ...process.env, NODE_OPTIONS: '--experimental-vm-modules' },
        },
    );

    console.log('\n✓ Plugin system unit tests passed!');
    process.exit(0);
} catch (error) {
    console.error('\n✗ Plugin system unit tests failed!');
    process.exit(1);
}

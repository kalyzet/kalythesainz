#!/usr/bin/env node

/**
 * Test runner for visual tools synchronization property tests
 */

import { execSync } from 'child_process';

try {
    console.log('Running visual tools synchronization property tests...\n');

    execSync(
        'npx jest tests/properties/visual-tools-sync.test.js --testTimeout=60000 --runInBand --setupFilesAfterEnv=<rootDir>/tests/setup.js',
        {
            stdio: 'inherit',
        },
    );

    console.log('\n✓ Visual tools synchronization property tests passed!');
    process.exit(0);
} catch (error) {
    console.error('\n✗ Visual tools synchronization property tests failed!');
    process.exit(1);
}

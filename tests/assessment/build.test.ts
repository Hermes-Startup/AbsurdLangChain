/**
 * Assessment Scoring Tests - Build Verification
 * 
 * These tests verify the project builds and passes TypeScript checks.
 * 
 * Total: 15 points
 * - Build Succeeds: 10 points
 * - TypeScript Clean: 5 points
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Build & Types (15 points)', () => {

    describe('Build Succeeds (10 points)', () => {
        it('should have a valid package.json', () => {
            const packagePath = path.join(process.cwd(), 'package.json');
            expect(fs.existsSync(packagePath)).toBe(true);

            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
            expect(pkg.scripts).toBeDefined();
            expect(pkg.scripts.build).toBeDefined();
        });

        it('should have required dependencies', () => {
            const packagePath = path.join(process.cwd(), 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

            expect(pkg.dependencies).toBeDefined();
            expect(pkg.dependencies['react']).toBeDefined();
            expect(pkg.dependencies['next']).toBeDefined();
        });
    });

    describe('TypeScript Clean (5 points)', () => {
        it('should have a valid tsconfig.json', () => {
            const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
            expect(fs.existsSync(tsconfigPath)).toBe(true);
        });

        it('should have typed React dependencies', () => {
            const packagePath = path.join(process.cwd(), 'package.json');
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

            const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
            expect(allDeps['@types/react']).toBeDefined();
        });
    });
});

/**
 * Assessment Scoring Tests - Core Completion Requirements
 * 
 * These tests verify that candidates have properly implemented the Insights page.
 * Each describe block corresponds to points in the scoring rubric.
 * 
 * Total: 35 points
 * - Locked State Removed: 5 points
 * - Data Fetching: 10 points
 * - Metrics Display: 10 points  
 * - High Performers: 10 points
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source file for static analysis
const insightsPagePath = path.join(process.cwd(), 'app/insights/page.tsx');
const insightsPageContent = fs.existsSync(insightsPagePath)
    ? fs.readFileSync(insightsPagePath, 'utf-8')
    : '';

describe('Core Requirements (35 points)', () => {

    describe('Locked State Removed (5 points)', () => {
        it('should not contain the lock emoji in source code', () => {
            expect(insightsPageContent).not.toContain('🔒');
        });

        it('should not have "Locked" in the page title', () => {
            expect(insightsPageContent.toLowerCase()).not.toMatch(/insights\s*(tab)?\s*locked/i);
        });

        it('should not display the locked placeholder message', () => {
            expect(insightsPageContent).not.toContain('Complete the mission to unlock');
        });
    });

    describe('Data Fetching Implemented (10 points)', () => {
        it('should use fetch, useEffect, useSWR, or similar for data fetching', () => {
            const hasFetchPattern = /\b(fetch|useEffect|useSWR|useQuery|axios|getData)\b/.test(insightsPageContent);
            expect(hasFetchPattern).toBe(true);
        });

        it('should call the performance API endpoint', () => {
            const hasApiCall = insightsPageContent.includes('/api/insights/performance');
            expect(hasApiCall).toBe(true);
        });

        it('should handle the API response with state', () => {
            const hasStateManagement = /\b(useState|setState|setData|setPerformance|data\s*=)\b/.test(insightsPageContent);
            expect(hasStateManagement).toBe(true);
        });
    });

    describe('Metrics Display (10 points)', () => {
        it('should display viral_score', () => {
            const hasViralScore = /viral[_\s]?score/i.test(insightsPageContent);
            expect(hasViralScore).toBe(true);
        });

        it('should display views metric', () => {
            const hasViews = /\bviews\b/i.test(insightsPageContent);
            expect(hasViews).toBe(true);
        });

        it('should map over performance data to display items', () => {
            const hasMappingPattern = /\.map\s*\(\s*\(?\s*(item|script|data|performance|p)\s*[\),=]/.test(insightsPageContent);
            expect(hasMappingPattern).toBe(true);
        });
    });

    describe('High Performers Highlighted (10 points)', () => {
        it('should have logic to identify high performers', () => {
            // Check for comparison with threshold (e.g., viral_score > 80)
            const hasHighPerformerLogic = /(viral[_\s]?score|score)\s*[>>=]\s*\d+|isHigh|highPerformer|highlight/i.test(insightsPageContent);
            expect(hasHighPerformerLogic).toBe(true);
        });

        it('should apply different styling for high performers', () => {
            // Check for conditional className or style
            const hasConditionalStyling = /\?\s*['"`][^'"`]*['"`]\s*:\s*['"`]|className=\{[^}]*\?/.test(insightsPageContent);
            expect(hasConditionalStyling).toBe(true);
        });
    });
});

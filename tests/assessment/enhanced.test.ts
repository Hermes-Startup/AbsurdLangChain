/**
 * Assessment Scoring Tests - Enhanced Features
 * 
 * These tests verify enhanced features beyond the core requirements.
 * 
 * Total: 25 points
 * - Sorting: 5 points
 * - Loading State: 5 points
 * - Error Handling: 5 points
 * - Gemini Integration: 10 points
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Read the actual source file for static analysis
const insightsPagePath = path.join(process.cwd(), 'app/insights/page.tsx');
const insightsPageContent = fs.existsSync(insightsPagePath)
    ? fs.readFileSync(insightsPagePath, 'utf-8')
    : '';

// Check for generate-summary API route
const generateSummaryPath = path.join(process.cwd(), 'app/api/insights/generate-summary/route.ts');
const hasGenerateSummaryRoute = fs.existsSync(generateSummaryPath);

describe('Enhanced Features (25 points)', () => {

    describe('Sorting Functionality (5 points)', () => {
        it('should implement sorting on the data', () => {
            const hasSortPattern = /\.sort\s*\(/.test(insightsPageContent);
            expect(hasSortPattern).toBe(true);
        });

        it('should sort by viral_score or similar metric', () => {
            const hasSortByScore = /sort\s*\([^)]*viral[_\s]?score/i.test(insightsPageContent) ||
                /sort\s*\([^)]*\.\s*(a|b)\s*-/.test(insightsPageContent);
            expect(hasSortByScore).toBe(true);
        });
    });

    describe('Loading State (5 points)', () => {
        it('should have loading state management', () => {
            const hasLoadingState = /\b(loading|isLoading|setLoading|setIsLoading)\b/.test(insightsPageContent);
            expect(hasLoadingState).toBe(true);
        });

        it('should display a loading indicator', () => {
            const hasLoadingUI = /(loading|spinner|skeleton|Loading\.\.\.)/i.test(insightsPageContent);
            expect(hasLoadingUI).toBe(true);
        });
    });

    describe('Error Handling (5 points)', () => {
        it('should have error state management', () => {
            const hasErrorState = /\b(error|isError|setError|catch)\b/.test(insightsPageContent);
            expect(hasErrorState).toBe(true);
        });

        it('should handle fetch errors with try-catch or .catch()', () => {
            const hasErrorHandling = /\.(catch|finally)\s*\(|try\s*\{/.test(insightsPageContent);
            expect(hasErrorHandling).toBe(true);
        });
    });

    describe('Gemini Integration (10 points)', () => {
        it('should call the generate-summary API', () => {
            // Look for actual fetch/API calls, not just text mentioning the API
            const hasGeminiCall = /fetch\s*\([^)]*['"`]\/api\/insights\/generate-summary['"`]|axios.*generate-summary|await.*generateSummary\(/i.test(insightsPageContent);
            expect(hasGeminiCall).toBe(true);
        });

        it('should have a generate-summary API route', () => {
            expect(hasGenerateSummaryRoute).toBe(true);
        });

        it('should display AI-generated summaries', () => {
            // Look for state management or variables that would hold AI summaries
            const hasSummaryDisplay = /\b(summary|aiSummary|generatedSummary)\s*[:=]|useState.*summary|\.summary\b/i.test(insightsPageContent);
            expect(hasSummaryDisplay).toBe(true);
        });
    });
});

/**
 * AST Utilities for Code Analysis
 * 
 * Uses TypeScript's AST to verify actual code patterns, not just text matching.
 * This prevents false positives from comments or strings containing keywords.
 */

import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

export interface ASTAnalysisResult {
    hasFetchCall: boolean;
    hasUseEffectCall: boolean;
    hasUseSWRCall: boolean;
    hasUseStateCall: boolean;
    hasApiEndpointCall: boolean;
    hasMapCall: boolean;
    hasConditionalExpression: boolean;
    fetchCalls: string[];
    hookCalls: string[];
    stateVariables: string[];
    apiEndpoints: string[];
}

/**
 * Parse TypeScript/TSX code and analyze for specific patterns
 */
export function analyzeCode(code: string): ASTAnalysisResult {
    const result: ASTAnalysisResult = {
        hasFetchCall: false,
        hasUseEffectCall: false,
        hasUseSWRCall: false,
        hasUseStateCall: false,
        hasApiEndpointCall: false,
        hasMapCall: false,
        hasConditionalExpression: false,
        fetchCalls: [],
        hookCalls: [],
        stateVariables: [],
        apiEndpoints: [],
    };

    try {
        const ast = parse(code, {
            jsx: true,
            loc: true,
            range: true,
            ecmaVersion: 2022,
        });

        // Walk the AST
        walkNode(ast, result);
    } catch (error) {
        console.error('AST parsing error:', error);
    }

    return result;
}

/**
 * Recursively walk the AST and collect information
 */
function walkNode(node: TSESTree.Node, result: ASTAnalysisResult): void {
    if (!node || typeof node !== 'object') return;

    // Check for function calls
    if (node.type === 'CallExpression') {
        const callee = node.callee;

        // Direct function calls: fetch(), useEffect(), etc.
        if (callee.type === 'Identifier') {
            const name = callee.name;

            if (name === 'fetch') {
                result.hasFetchCall = true;
                // Check if it's calling an API endpoint
                if (node.arguments.length > 0) {
                    const firstArg = node.arguments[0];
                    if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                        result.fetchCalls.push(firstArg.value);
                        if (firstArg.value.includes('/api/')) {
                            result.hasApiEndpointCall = true;
                            result.apiEndpoints.push(firstArg.value);
                        }
                    }
                    if (firstArg.type === 'TemplateLiteral') {
                        // Template literal like `${baseUrl}/api/...`
                        const raw = firstArg.quasis.map(q => q.value.raw).join('');
                        if (raw.includes('/api/')) {
                            result.hasApiEndpointCall = true;
                            result.apiEndpoints.push(raw);
                        }
                    }
                }
            }

            if (name === 'useEffect') {
                result.hasUseEffectCall = true;
                result.hookCalls.push('useEffect');
            }

            if (name === 'useSWR' || name === 'useQuery') {
                result.hasUseSWRCall = true;
                result.hookCalls.push(name);
            }

            if (name === 'useState') {
                result.hasUseStateCall = true;
                result.hookCalls.push('useState');
            }
        }

        // Member expression calls: array.map(), data.map(), etc.
        if (callee.type === 'MemberExpression') {
            const property = callee.property;
            if (property.type === 'Identifier' && property.name === 'map') {
                result.hasMapCall = true;
            }
        }
    }

    // Check for conditional expressions (ternary)
    if (node.type === 'ConditionalExpression') {
        result.hasConditionalExpression = true;
    }

    // Check for variable declarations with useState
    if (node.type === 'VariableDeclarator') {
        if (node.init?.type === 'CallExpression') {
            const callee = node.init.callee;
            if (callee.type === 'Identifier' && callee.name === 'useState') {
                // Extract the variable name
                if (node.id.type === 'ArrayPattern' && node.id.elements.length > 0) {
                    const firstElement = node.id.elements[0];
                    if (firstElement?.type === 'Identifier') {
                        result.stateVariables.push(firstElement.name);
                    }
                }
            }
        }
    }

    // Recurse into child nodes
    for (const key of Object.keys(node)) {
        const value = (node as unknown as Record<string, unknown>)[key];
        if (Array.isArray(value)) {
            for (const child of value) {
                if (child && typeof child === 'object' && 'type' in child) {
                    walkNode(child as TSESTree.Node, result);
                }
            }
        } else if (value && typeof value === 'object' && 'type' in value) {
            walkNode(value as TSESTree.Node, result);
        }
    }
}

/**
 * Check if code has proper data fetching implementation
 */
export function hasDataFetching(code: string): boolean {
    const analysis = analyzeCode(code);
    return analysis.hasFetchCall || analysis.hasUseEffectCall || analysis.hasUseSWRCall;
}

/**
 * Check if code calls a specific API endpoint
 */
export function hasApiCall(code: string, endpoint: string): boolean {
    const analysis = analyzeCode(code);
    return analysis.apiEndpoints.some(ep => ep.includes(endpoint));
}

/**
 * Check if code has state management
 */
export function hasStateManagement(code: string): boolean {
    const analysis = analyzeCode(code);
    return analysis.hasUseStateCall && analysis.stateVariables.length > 0;
}

/**
 * Check if code has array mapping (for displaying lists)
 */
export function hasArrayMapping(code: string): boolean {
    const analysis = analyzeCode(code);
    return analysis.hasMapCall;
}

/**
 * Check if code has conditional rendering
 */
export function hasConditionalRendering(code: string): boolean {
    const analysis = analyzeCode(code);
    return analysis.hasConditionalExpression;
}

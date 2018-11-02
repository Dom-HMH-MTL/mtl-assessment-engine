import { ResponseValidation, Strategy } from '../model/ResponseValidation';

export const matchers: Map<Strategy, (el: ResponseValidation, response: any) => boolean> = new Map();

/**
 * ANY matcher
 *
 * The student answer contains any of the expected values
 */
matchers.set(
    Strategy.ANY,
    (el: ResponseValidation, response: string[]): boolean => {
        const expected: string[] = el.expected.split('|');
        return expected.some((answer: string) => response.includes(answer));
    }
);

/**
 * CONTAINS matcher
 *
 * The student answer contains all of the expected values
 */
matchers.set(
    Strategy.CONTAINS,
    (el: ResponseValidation, response: string[]): boolean => {
        const expected: string[] = el.expected.split('|');
        return expected.every((answer: string) => response.includes(answer));
    }
);

/**
 * EXACT_MATCH matcher
 *
 * The student answer is strictly equal to the expected value
 */
matchers.set(
    Strategy.EXACT_MATCH,
    (el: ResponseValidation, response: string | string[]): boolean => {
        if (Array.isArray(response)) {
            const expected: string[] = el.expected.split('|');
            return response.length === expected.length && expected.every((answer: string) => response.includes(answer));
        } else {
            return el.expected === response.trim();
        }
    }
);

/**
 * EXACT_ORDER matcher
 *
 * The student answer is strictly equal to the expected value
 */
matchers.set(
    Strategy.EXACT_ORDER,
    (el: ResponseValidation, response: string[]): boolean => {
        const expected: string[] = el.expected.split('|');
        return response.length === expected.length && response.join() === expected.join();
    }
);

/**
 * FUZZY_MATCH matcher
 *
 * Same as exact match, but case insensitive
 */
matchers.set(
    Strategy.FUZZY_MATCH,
    (el: ResponseValidation, response: string): boolean => {
        return el.expected.toLowerCase() === response.trim().toLowerCase();
    }
);

/**
 * MATH_EQUIVALENT matcher
 *
 * Not yet implemented
 */
matchers.set(
    Strategy.MATH_EQUIVALENT,
    (el: ResponseValidation, response: string): boolean => {
        throw new Error('Feedback strategy not yet implemented: MATH_EQUIVALENT');
    }
);

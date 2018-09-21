import { Problem } from './Problem';
import { injectVariables } from './VariableHelpers';

export const prepareStatements = (problem: Problem): string[] => {
    if (!problem.cachedStatemnents) {
        problem.cachedStatemnents = problem.template.map((statement: string): string => cleanHTML(injectVariables(statement, problem.variables)));
    }
    return problem.cachedStatemnents;
};

export function cleanHTML(statement: any): string {
    if (statement === undefined || statement === null) {
        return '';
    }
    if (typeof statement === 'number') {
        return Number(statement).toString();
    }
    if (typeof statement !== 'string') {
        return cleanHTML(statement.toString());
    }
    return statement;
}

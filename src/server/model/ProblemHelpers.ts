import { Content } from './Content';
import { Problem } from './Problem';
import { injectVariables } from './VariableHelpers';

export const prepareStatements = (problem: Problem): string[] => {
    if (!problem.cachedStatemnents) {
        if (!Array.isArray(problem.templates)) {
            throw new Error('Template data has not been loaded!');
        }
        // FIXME: do not only process 'en' language
        problem.cachedStatemnents = problem.templates.map((content: Content): string => cleanHTML(injectVariables(content.text.en, problem.variables)));
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

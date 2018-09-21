import { Problem } from './Problem';
import { Variable } from './Variable';
import { prepareValue } from './VariableHelpers';

export const prepareStatements = (problem: Problem): string[] => {
    if (!problem.cachedStatemnents) {
        problem.cachedStatemnents = problem.template.map((statement: string): string => cleanHTML(injectVariables(statement, problem.variables)));
    }
    return problem.cachedStatemnents;
};

function injectVariables(statement: string, variables: Variable[]): string {
    variables.forEach(
        (variable: Variable, index: number): void => {
            statement = statement.replace(`$V[${index}]`, prepareValue(variable, variables));
        }
    );
    return statement;
}

function cleanHTML(statement: string): string {
    return statement;
}

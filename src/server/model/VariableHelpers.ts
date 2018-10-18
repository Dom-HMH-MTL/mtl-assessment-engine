import { Variable, VariableType } from './Variable';

export function injectVariables(source: string, variables: Variable[], imposedLimit: number = Infinity): string {
    return variables.reduce(
        (accumulator: string, element: Variable, idx: number, elements: Variable[]): string =>
            idx < imposedLimit ? accumulator.replace(`$V[${idx}]`, prepareValue(idx, element, elements)) : accumulator,
        source
    );
}

// `export`-ed for test purposes only
export const prepareValue = (index: number, variable: Variable, variables: Variable[]): any => {
    if (!variable.cachedValue) {
        let preparation: any;
        switch (variable.type) {
            case VariableType.text:
                preparation = variable.text;
                break;
            case VariableType.interval:
                preparation = pickAValue(prepareInterval(index, variable, variables));
                break;
            case VariableType.expression:
                preparation = evaluateExpression(index, variable, variables);
                break;
        }
        variable.cachedValue = preparation;
    }
    return variable.cachedValue;
};

function pickAValue(distribution: any[]): any {
    return distribution[Math.floor(Math.random() * distribution.length)];
}

function resolveNumber(source: number | string, index: number, variables: Variable[]): number {
    if (typeof source === 'string') {
        return Number(injectVariables(source, variables, index));
    }
    return source;
}

function prepareInterval(index: number, variable: Variable, variables: Variable[]): number[] {
    const min: number = resolveNumber(variable.minimum, index, variables);
    const max: number = resolveNumber(variable.maximum, index, variables);
    const step: number = resolveNumber(variable.step, index, variables);
    const excludes: number[] = (variable.excludes || []).map((exclude: any): number => resolveNumber(exclude, index, variables));

    const candidates: number[] = [];
    const noDecimal: boolean = variable.precision === 0;
    const precisionFactor: number = Math.pow(10, variable.precision);

    for (let value: number = min; value <= max; value += step) {
        value = noDecimal ? Math.floor(value) : Math.floor(value * precisionFactor + 0.50000001) / precisionFactor;
        if (!excludes.includes(value)) {
            candidates.push(value);
        }
    }

    const distributed: number[] = [];
    while (0 < candidates.length) {
        // Could stop at 0 but continues for completion sakeness
        distributed.push(candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0]);
    }
    return distributed;
}

function evaluateExpression(index: number, variable: Variable, variables: Variable[]): number | string {
    try {
        // tslint:disable-next-line: no-eval
        return eval(injectVariables(variable.expression, variables, index));
    } catch (ex) {
        // tslint:disable-next-line: no-console
        console.log('Expression evaluation of', variable, 'failed with:\n', ex);
        return `Incorrect expression V[${index}]`;
    }
    // return 15;
}

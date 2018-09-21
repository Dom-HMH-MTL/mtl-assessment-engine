import { Variable, VariableType } from './Variable';

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
        }
        variable.cachedValue = preparation;
    }
    return variable.cachedValue;
};

export function injectVariables(source: string, variables: Variable[], lastVariableIdx?: number): number | string {
    for (let idx = 0, limit = lastVariableIdx || variables.length; idx < limit; idx += 1) {
        source = source.replace(`$V[${idx}]`, prepareValue(idx, variables[idx], variables));
    }
    const conversion: number = Number(source);
    return isNaN(conversion) ? source : conversion;
}

function pickAValue(distribution: any[]): any {
    return distribution[Math.floor(Math.random() * distribution.length)];
}

const prepareInterval = (index: number, variable: Variable, variables: Variable[]): number[] => {
    const min: number = typeof variable.minimum === 'string' ? (injectVariables(variable.minimum, variables, index) as number) : variable.minimum;
    const max: number = typeof variable.maximum === 'string' ? (injectVariables(variable.maximum, variables, index) as number) : variable.maximum;
    const step: number = typeof variable.step === 'string' ? (injectVariables(variable.step, variables, index) as number) : variable.step;
    const excludes: number[] = (variable.excludes || []).map(
        (exclude: number | string): number => (typeof exclude === 'string' ? (injectVariables(exclude, variables, index) as number) : exclude)
    );

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
};

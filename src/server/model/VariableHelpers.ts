import { Variable, VariableType } from './Variable';

export const prepareValue = (variable: Variable, variables: Variable[]): any => {
    if (!variable.cachedValue) {
        let preparation: any;
        switch (variable.type) {
            case VariableType.text:
                preparation = variable.text;
                break;
            case VariableType.interval:
                preparation = pickAValue(prepareInterval(variable, variables));
                break;
        }
        variable.cachedValue = preparation;
    }
    return variable.cachedValue;
};

function pickAValue(distribution: any[]): any {
    return distribution[Math.floor(Math.random() * distribution.length)];
}

function replaceVariableRef(reference: string, variables: Variable[]): any {
    return 123;
}

const prepareInterval = (variable: Variable, variables: Variable[]): number[] => {
    const min: number = typeof variable.minimum === 'string' ? replaceVariableRef(variable.minimum, variables) : variable.minimum;
    const max: number = typeof variable.maximum === 'string' ? replaceVariableRef(variable.maximum, variables) : variable.maximum;
    const step: number = typeof variable.step === 'string' ? replaceVariableRef(variable.step, variables) : variable.step;
    const excludes: number[] = (variable.excludes || []).map(
        (exclude: number | string): number => (typeof exclude === 'string' ? replaceVariableRef(exclude, variables) : exclude)
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

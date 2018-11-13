import intern from 'intern';
import { Variable, VariableType } from '../../server/model/Variable';
import { evaluateExpression, prepareValue } from '../../server/model/VariableHelpers';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        suite(
            'prepareStatements',
            (): void => {
                test('default `text` type', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.text;
                    variable.text = 'TEXT';
                    const value: any = prepareValue(0, variable, [variable]);
                    assert.deepEqual(value, 'TEXT');
                    assert.deepEqual(prepareValue(0, variable, [variable]), value); // To verify it has been cached!
                });
                test('not supported type', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = null; // unsupported type in purpose
                    assert.deepEqual(prepareValue(0, variable, [variable]), undefined);
                });
                test('type `expression` without value', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.expression;
                    const value: any = prepareValue(0, variable, [variable]);
                    assert.isUndefined(value);
                    assert.strictEqual(prepareValue(0, variable, [variable]), value); // To verify it has been cached!
                });
                test('type `expression` with valid value', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.expression;
                    variable.expectedType = VariableType.number;
                    variable.expression = 'Math.max(1,2)';
                    const value: any = prepareValue(0, variable, [variable]);
                    assert.deepEqual(value, 2);
                    assert.strictEqual(prepareValue(0, variable, [variable]), value); // To verify it has been cached!
                });
                test('type `interval` with one Integer value', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.interval;
                    variable.minimum = 12;
                    variable.maximum = 12;
                    variable.step = 1;
                    assert.deepEqual(prepareValue(0, variable, [variable]), 12);
                });
                test('type `interval` with one Floating Point value', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.interval;
                    variable.minimum = 23.23;
                    variable.maximum = 23.23;
                    variable.step = 1;
                    variable.precision = 2;
                    assert.deepEqual(prepareValue(0, variable, [variable]), 23.23);
                });
                test('type `interval` with an exclusion', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.interval;
                    variable.minimum = 32;
                    variable.maximum = 33;
                    variable.step = 1;
                    variable.precision = 0;
                    variable.excludes = [33];
                    assert.deepEqual(prepareValue(0, variable, [variable]), 32);
                });
                test('type `interval` with references to other variables', (): void => {
                    const baseLow: Variable = Variable.getInstance();
                    baseLow.type = VariableType.interval;
                    baseLow.minimum = 1;
                    baseLow.maximum = 1;
                    const baseHigh: Variable = Variable.getInstance();
                    baseHigh.type = VariableType.interval;
                    baseHigh.minimum = 2;
                    baseHigh.maximum = 2;
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.interval;
                    variable.minimum = '$V[0]';
                    variable.maximum = '$V[1]';
                    variable.step = '$V[0]';
                    variable.excludes = ['$V[1]'];
                    assert.deepEqual(prepareValue(2, variable, [baseLow, baseHigh, variable]), 1);
                });
            }
        );
        suite(
            'evaluateExpression',
            (): void => {
                test('invalid expression', (): void => {
                    const variable: Variable = Variable.getInstance();
                    variable.type = VariableType.expression;
                    variable.expression = 'whatever';
                    assert.strictEqual(evaluateExpression(0, variable, [variable]), 'Incorrect expression V[0]');
                });
            }
        );
    }
);

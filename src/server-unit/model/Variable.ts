import intern from 'intern';
import { Variable, VariableType } from '../../server/model/Variable';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends Variable {
    public static getInstance(): TestModel {
        return new TestModel();
    }

    public additional: number;
}

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        let source: TestModel;

        beforeEach(
            (): void => {
                source = TestModel.getInstance();
            }
        );

        afterEach(
            (): void => {
                source = null;
            }
        );

        test('static factory', (): void => {
            assert.deepEqual(Variable.getInstance(), Variable.getInstance());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.text);
                    assert.deepEqual(result.expectedType, VariableType.text);
                    assert.strictEqual(result.precision, 0);
                    assert.deepEqual(result.text, '');
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with `text` payload', (): void => {
                    const content: { [key: string]: any } = { expectedType: 'number', type: 'text', text: 'ttt' };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.text);
                    assert.deepEqual(result.expectedType, VariableType.number);
                    assert.strictEqual(result.precision, 0);
                    assert.deepEqual(result.text, content.text);
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with `interval` payload', (): void => {
                    const content: { [key: string]: any } = {
                        excludes: [0, 2, 4],
                        maximum: 6.28218,
                        minimum: 3.14159,
                        precision: 2,
                        step: 0.3333333333,
                        type: VariableType.interval
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.interval);
                    assert.strictEqual(result.precision, 2);
                    assert.isUndefined(result.text);
                    assert.strictEqual(result.minimum, content.minimum);
                    assert.strictEqual(result.maximum, content.maximum);
                    assert.strictEqual(result.step, content.step);
                    assert.deepEqual(result.excludes, content.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with `expression` payload', (): void => {
                    const content: { [key: string]: any } = { type: 'expression', expression: 'ttt' };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.expression);
                    assert.strictEqual(result.precision, 0);
                    assert.isUndefined(result.text);
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.deepEqual(result.expression, content.expression);
                });
                test('with cached value', (): void => {
                    const content: { [key: string]: any } = { cachedValue: '"whatever"' };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.strictEqual(result.cachedValue, 'whatever');
                });
            }
        );

        suite(
            'toDdb()',
            (): void => {
                test('with minimal output', (): void => {
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expectedType: undefined,
                        precision: undefined,
                        text: undefined,
                        type: undefined
                    });
                });
                test('with `text` output', (): void => {
                    source.text = 'this is some text';
                    source.expectedType = VariableType.number;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expectedType: { S: 'number' },
                        precision: undefined,
                        text: { S: 'this is some text' },
                        type: undefined
                    });
                });
                test('with `interval` &  numbers', (): void => {
                    source.authorId = '12345';
                    source.type = VariableType.interval;
                    source.expectedType = VariableType.number;
                    source.minimum = 3.14;
                    source.maximum = 6.28;
                    source.precision = 2;
                    source.step = 0.33333;
                    source.excludes = [2];
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: { S: '12345' },
                        excludes: {
                            L: [
                                {
                                    N: '2'
                                }
                            ]
                        },
                        expectedType: { S: 'number' },
                        maximum: { N: '6.28' },
                        minimum: { N: '3.14' },
                        precision: { N: '2' },
                        step: { N: '0.33333' },
                        type: { S: 'interval' }
                    });
                });
                test('with `interval` &  references', (): void => {
                    source.type = VariableType.interval;
                    source.minimum = '$V[0]';
                    source.maximum = '$V[1]';
                    source.precision = 0;
                    source.step = '$V[3]';
                    source.excludes = ['$V[4]'];
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        excludes: {
                            L: [
                                {
                                    S: '$V[4]'
                                }
                            ]
                        },
                        expectedType: undefined,
                        maximum: { S: '$V[1]' },
                        minimum: { S: '$V[0]' },
                        precision: undefined,
                        step: { S: '$V[3]' },
                        type: { S: 'interval' }
                    });
                });
                test('with `expression` output', (): void => {
                    source.expression = 'this is some expression';
                    source.type = VariableType.expression;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expectedType: undefined,
                        expression: { S: 'this is some expression' },
                        precision: undefined,
                        type: { S: 'expression' }
                    });
                });
                test('with cached value', (): void => {
                    source.cachedValue = 'whatever';
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        cachedValue: { S: '"whatever"' },
                        expectedType: undefined,
                        precision: undefined,
                        text: undefined,
                        type: undefined
                    });
                });
            }
        );

        suite(
            'fromHttp()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.text);
                    assert.deepEqual(result.expectedType, VariableType.text);
                    assert.strictEqual(result.precision, 0);
                    assert.deepEqual(result.text, '');
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with `text` payload', (): void => {
                    const content: { [key: string]: any } = { expectedType: 'number', type: 'text', text: 'ttt' };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.text);
                    assert.deepEqual(result.expectedType, VariableType.number);
                    assert.strictEqual(result.precision, 0);
                    assert.deepEqual(result.text, 'ttt');
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with partial `interval` payload', (): void => {
                    const content: { [key: string]: any } = { maximum: 6.28218, minimum: 3.14159, precision: 2, type: VariableType.interval };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.interval);
                    assert.strictEqual(result.precision, 2);
                    assert.isUndefined(result.text);
                    assert.strictEqual(result.minimum, content.minimum);
                    assert.strictEqual(result.maximum, content.maximum);
                    assert.strictEqual(result.step, 1);
                    assert.deepEqual(result.excludes, []);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with complete `interval` payload', (): void => {
                    const content: { [key: string]: any } = {
                        excludes: [0, 2, 4],
                        maximum: 6.28218,
                        minimum: 3.14159,
                        precision: 2,
                        step: 0.3333333333,
                        type: VariableType.interval
                    };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.interval);
                    assert.strictEqual(result.precision, 2);
                    assert.isUndefined(result.text);
                    assert.strictEqual(result.minimum, content.minimum);
                    assert.strictEqual(result.maximum, content.maximum);
                    assert.strictEqual(result.step, content.step);
                    assert.deepEqual(result.excludes, content.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.isUndefined(result.expression);
                });
                test('with `expression` payload', (): void => {
                    const content: { [key: string]: any } = { type: 'expression', expression: 'ttt' };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.type, VariableType.expression);
                    assert.strictEqual(result.precision, 0);
                    assert.isUndefined(result.text);
                    assert.isUndefined(result.minimum);
                    assert.isUndefined(result.maximum);
                    assert.isUndefined(result.step);
                    assert.isUndefined(result.excludes);
                    assert.isUndefined(result.valueSet);
                    assert.isUndefined(result.valueSelector);
                    assert.deepEqual(result.expression, 'ttt');
                });
                test('with cached value', (): void => {
                    const content: { [key: string]: any } = { cachedValue: 'whatever' };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.cachedValue, 'whatever');
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output', (): void => {
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: undefined, id: undefined, type: 'text', text: undefined });
                });
                test('with `text` output', (): void => {
                    source.authorId = '000';
                    source.expectedType = VariableType.text;
                    source.id = '111';
                    source.text = 'this is some text';
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: '000', id: '111', type: 'text', text: 'this is some text' });
                });
                test('with partial `interval` paylod', (): void => {
                    source.id = '111';
                    source.type = VariableType.interval;
                    source.expectedType = VariableType.number;
                    source.minimum = 3.14;
                    source.maximum = '$V[1]';
                    source.step = 1;
                    source.excludes = [];
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expectedType: 'number',
                        id: '111',
                        maximum: '$V[1]',
                        minimum: 3.14,
                        type: 'interval'
                    });
                });
                test('with complete `interval` paylod', (): void => {
                    source.id = '111';
                    source.type = VariableType.interval;
                    source.minimum = 3.14;
                    source.maximum = '$V[1]';
                    source.precision = 2;
                    source.step = '$V[3]';
                    source.excludes = [2];
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        excludes: [2],
                        id: '111',
                        maximum: '$V[1]',
                        minimum: 3.14,
                        precision: 2,
                        step: '$V[3]',
                        type: 'interval'
                    });
                });
                test('with `expression` output', (): void => {
                    source.authorId = '000';
                    source.expectedType = VariableType.text;
                    source.id = '111';
                    source.type = VariableType.expression;
                    source.expression = 'this is some expression';
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: '000', id: '111', type: 'expression', expression: 'this is some expression' });
                });
                test('with cached value', (): void => {
                    source.authorId = '000';
                    source.id = '111';
                    source.cachedValue = 'whatever';
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: '000', id: '111', type: 'text', text: undefined, cachedValue: 'whatever' });
                });
            }
        );
    }
);

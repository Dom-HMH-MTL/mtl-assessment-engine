import intern from 'intern';
import { Problem } from '../../server/model/Problem';
import { Variable } from '../../server/model/Variable';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends Problem {
    public additional: number;
}

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        let source: TestModel;

        beforeEach((): void => {
            source = Object.assign(new TestModel(), { template: ['111', '222'], variables: [], additional: 999 });
        });

        afterEach((): void => {
            source = null;
        });

        test('static factory', (): void => {
            assert.deepEqual(Problem.getInstance(), new Problem());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.template, []);
                    assert.deepEqual(result.variables, []);
                    assert.strictEqual(result.additional, 999);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        template: { L: [{ S: 'aaa' }] },
                        variables: {
                            L: [{ M: { type: { S: 'text' }, text: { S: 'ttt' } } }]
                        }
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.template, ['aaa']);
                    assert.deepEqual(result.variables, [Object.assign(new Variable(), { type: 'text', text: 'ttt', precision: 0 })]);
                    assert.strictEqual(result.additional, 999);
                });
            }
        );

        suite(
            'toDdb()',
            (): void => {
                test('with minimal output', (): void => {
                    source.template.length = 0;
                    source.variables = [];
                    delete source.additional;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.isUndefined(result.template);
                    assert.isUndefined(result.variables);
                });
                test('with maximal output', (): void => {
                    const variable: Variable = {
                        toDdb: (): any => ({
                            a: 'here'
                        })
                    } as Variable;
                    source.variables = [variable];
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result.template, { L: [{ S: '111' }, { S: '222' }] });
                    assert.deepEqual(result.variables, { L: [{ M: { a: 'here' } }] });
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
                    assert.isUndefined(result.template);
                    assert.deepEqual(result.variables, []);
                    assert.strictEqual(result.additional, 999);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = { template: ['aaa'], variables: [{ type: 'text', text: 'ttt' }] };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.template, ['aaa']);
                    assert.deepEqual(result.variables, [new Variable().fromHttp(content.variables[0])]);
                    assert.strictEqual(result.additional, 999);
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output', (): void => {
                    delete source.template;
                    source.variables = [];
                    delete source.additional;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.isUndefined(result.template);
                    assert.isUndefined(result.variables);
                });
                test('with maximal output', (): void => {
                    const variable: Variable = {
                        toHttp: (): any => 'here'
                    } as Variable;
                    source.variables = [variable];
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result.template, ['111', '222']);
                    assert.deepEqual(result.variables, ['here']);
                });
            }
        );
    }
);

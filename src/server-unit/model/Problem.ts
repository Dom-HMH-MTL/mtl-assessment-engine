import intern from 'intern';
import { Content } from '../../server/model/Content';
import { Problem } from '../../server/model/Problem';
import { Variable } from '../../server/model/Variable';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends Problem {
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
                source = Object.assign(TestModel.getInstance(), {
                    additional: 999,
                    dependencies: ['000'],
                    templateIds: ['111', '222'],
                    templates: [Object.assign(Content.getInstance(), { text: { en: 'this is a template' } })],
                    variables: []
                });
            }
        );

        afterEach(
            (): void => {
                source = null;
            }
        );

        test('static factory', (): void => {
            assert.deepEqual(Problem.getInstance(), Problem.getInstance());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    delete source.templates; // Because templates field is not unmarshalled
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.dependencies, []);
                    assert.deepEqual(result.templateIds, []);
                    assert.isUndefined(result.templates);
                    assert.deepEqual(result.variables, []);
                    assert.strictEqual(result.additional, 999);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        dependencies: { L: [{ S: '000' }] },
                        templateIds: { L: [{ S: 'aaa' }] },
                        templates: { L: [] },
                        variables: {
                            L: [{ M: { type: { S: 'text' }, text: { S: 'ttt' } } }]
                        }
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    delete source.templates; // Because templates field is not unmarshalled
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.dependencies, ['000']);
                    assert.deepEqual(result.templateIds, ['aaa']);
                    assert.isUndefined(result.templates);
                    assert.deepEqual(result.variables, [
                        Object.assign(Variable.getInstance(), { authorId: undefined, type: 'text', text: 'ttt', precision: 0 })
                    ]);
                    assert.strictEqual(result.additional, 999);
                });
            }
        );

        suite(
            'toDdb()',
            (): void => {
                test('with minimal output', (): void => {
                    source.dependencies.length = 0;
                    source.templateIds.length = 0;
                    source.templates.length = 0;
                    source.variables = [];
                    delete source.additional;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.isUndefined(result.dependencies);
                    assert.isUndefined(result.templateIds);
                    assert.isUndefined(result.templates);
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
                    assert.deepEqual(result.dependencies, { L: [{ S: '000' }] });
                    assert.deepEqual(result.templateIds, { L: [{ S: '111' }, { S: '222' }] });
                    assert.isUndefined(result.templates); // To verify templates is not marshalled
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
                    assert.deepEqual(result.dependencies, []);
                    assert.isUndefined(result.templateIds);
                    assert.deepEqual(result.templates, source.templates); // Not changed
                    assert.deepEqual(result.variables, []);
                    assert.strictEqual(result.additional, 999);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        dependencies: ['000'],
                        templateIds: ['aaa'],
                        templates: [{ text: { en: 'another template' } }],
                        variables: [{ type: 'text', text: 'ttt' }]
                    };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.dependencies, ['000']);
                    assert.deepEqual(result.templateIds, ['aaa']);
                    assert.deepEqual(result.templates[0].text, { en: 'another template' });
                    assert.deepEqual(result.variables, [Variable.getInstance().fromHttp(content.variables[0])]);
                    assert.strictEqual(result.additional, 999);
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output', (): void => {
                    source.dependencies = [];
                    delete source.templateIds;
                    delete source.templates;
                    source.variables = [];
                    delete source.additional;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.isUndefined(result.dependencies);
                    assert.isUndefined(result.templateIds);
                    assert.isUndefined(result.templates);
                    assert.isUndefined(result.variables);
                });
                test('with maximal output', (): void => {
                    const variable: Variable = {
                        toHttp: (): any => 'here'
                    } as Variable;
                    source.variables = [variable];
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result.dependencies, ['000']);
                    assert.deepEqual(result.templateIds, ['111', '222']);
                    assert.deepEqual(result.templates, [
                        { authorId: undefined, id: undefined, text: { en: 'this is a template' }, type: undefined, description: undefined }
                    ]);
                    assert.deepEqual(result.variables, ['here']);
                });
            }
        );
    }
);

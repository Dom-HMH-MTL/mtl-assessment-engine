import intern from 'intern';
import { Content } from '../../server/model/Content';
import { Problem } from '../../server/model/Problem';
import { cleanHTML, prepareStatements } from '../../server/model/ProblemHelpers';
import { Variable, VariableType } from '../../server/model/Variable';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        suite(
            'prepareStatements',
            (): void => {
                test('not fully fetched', (): void => {
                    const problem: Problem = Problem.getInstance();
                    assert.throws(() => prepareStatements(problem), 'Template data has not been loaded!');
                });
                test('no statement', (): void => {
                    const problem: Problem = Problem.getInstance();
                    problem.templates = [];
                    const statements: string[] = prepareStatements(problem);
                    assert.deepEqual(statements, []);
                    assert.deepEqual(prepareStatements(problem), statements); // To verify it has been cached!
                });
                test('one statement, no variable', (): void => {
                    const problem: Problem = Problem.getInstance();
                    problem.templates = [Object.assign(Content.getInstance(), { text: { en: 'First statement' }, type: 'chapter' })];
                    assert.deepEqual(prepareStatements(problem), ['First statement']);
                });
                test('one statement, one `text` variable', (): void => {
                    const variable = Variable.getInstance();
                    variable.type = VariableType.text;
                    variable.text = 'TEXT';
                    const problem: Problem = Problem.getInstance();
                    problem.templates = [Object.assign(Content.getInstance(), { text: { en: 'First statement with some $V[0]' }, type: 'chapter' })];
                    problem.variables.push(variable);
                    assert.deepEqual(prepareStatements(problem), ['First statement with some TEXT']);
                });
            }
        );

        suite(
            'cleanHTML',
            (): void => {
                test('empty', (): void => {
                    assert.strictEqual(cleanHTML(undefined), '');
                    assert.strictEqual(cleanHTML(null), '');
                });
                test('a string', (): void => {
                    assert.strictEqual(cleanHTML('text'), 'text');
                });
                test('a number', (): void => {
                    assert.strictEqual(cleanHTML(123), '123');
                });
                test('a Number instance', (): void => {
                    assert.strictEqual(cleanHTML(Number(123)), '123');
                });
                test('a Object instance', (): void => {
                    assert.strictEqual(
                        cleanHTML({
                            toString: (): string => 'this one'
                        }),
                        'this one'
                    );
                });
            }
        );
    }
);

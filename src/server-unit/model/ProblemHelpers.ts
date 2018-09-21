import intern from 'intern';
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
                test('no statement', (): void => {
                    const problem: Problem = new Problem();
                    const statements: string[] = prepareStatements(problem);
                    assert.deepEqual(statements, []);
                    assert.deepEqual(prepareStatements(problem), statements); // To verify it has been cached!
                });
                test('one statement, no variable', (): void => {
                    const problem: Problem = new Problem();
                    problem.template.push('First statement');
                    assert.deepEqual(prepareStatements(problem), ['First statement']);
                });
                test('one statement, one `text` variable', (): void => {
                    const variable = new Variable();
                    variable.type = VariableType.text;
                    variable.text = 'TEXT';
                    const problem: Problem = new Problem();
                    problem.template.push('First statement with some $V[0]');
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

import intern from 'intern';
import { ProblemResponse } from '../../server/model/ProblemResponse';
import { FeedbackType, ResponseValidation, Strategy } from '../../server/model/ResponseValidation';
import { Variable } from '../../server/model/Variable';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends ProblemResponse {
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
                    evaluations: {
                        widgetId: Object.assign(ResponseValidation.getInstance(), {
                            expected: '2',
                            feedbackType: FeedbackType.NEUTRAL,
                            score: 2,
                            strategy: Strategy.EXACT_ORDER
                        })
                    },
                    feedbackType: FeedbackType.NEUTRAL,
                    problemId: 'prob-12345',
                    score: 345,
                    values: { widgetId: 'this is a value' },
                    variables: [Object.assign(Variable.getInstance(), { text: 'this is text', type: 'text' })]
                });
            }
        );

        afterEach(
            (): void => {
                source = null;
            }
        );

        test('static factory', (): void => {
            assert.deepEqual(ProblemResponse.getInstance(), ProblemResponse.getInstance());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.deepEqual(result.evaluations, {});
                    assert.isUndefined(result.feedbackType);
                    assert.isUndefined(result.problemId);
                    assert.isUndefined(result.score);
                    assert.deepEqual(result.values, {});
                    assert.deepEqual(result.variables, []);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        evaluations: { M: { otherId: { M: { authorId: { S: 'loggedUserId' }, expected: { S: '3' } } } } },
                        feedbackType: { S: 'positive' },
                        problemId: { S: 'prob-99999' },
                        score: { N: '4' },
                        values: { M: { otherId: { S: '"serialized data"' } } },
                        variables: [{ M: { text: { S: 'some text' }, type: { S: 'text' } } }]
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.evaluations, {
                        otherId: Object.assign(ResponseValidation.getInstance(), {
                            authorId: 'loggedUserId',
                            expected: '3',
                            feedbackType: FeedbackType.POSITIVE,
                            score: 0,
                            strategy: Strategy.EXACT_MATCH
                        })
                    });
                    assert.strictEqual(result.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(result.problemId, 'prob-99999');
                    assert.strictEqual(result.score, 4);
                    assert.deepEqual(result.values, { otherId: 'serialized data' });
                    assert.deepEqual(result.variables, [Object.assign(Variable.getInstance(), { authorId: undefined, text: 'some text', type: 'text' })]);
                });
            }
        );

        suite(
            'toDdb()',
            (): void => {
                test('with minimal output', (): void => {
                    const otherSource: TestModel = TestModel.getInstance();
                    delete otherSource.evaluations;
                    delete otherSource.values;
                    const result: { [key: string]: any } = otherSource.toDdb();
                    assert.isUndefined(result.evaluations);
                    assert.isUndefined(result.feedbackType);
                    assert.isUndefined(result.problemId);
                    assert.isUndefined(result.score);
                    assert.isUndefined(result.values);
                    assert.isUndefined(result.variables);
                });
                test('with normal output', (): void => {
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result.evaluations, {
                        M: {
                            widgetId: {
                                M: {
                                    authorId: undefined,
                                    expected: { S: '2' },
                                    feedbackType: { S: 'neutral' },
                                    score: { N: '2' },
                                    strategy: { S: 'exactOrder' }
                                }
                            }
                        }
                    });
                    assert.deepEqual(result.feedbackType, { S: 'neutral' });
                    assert.deepEqual(result.problemId, { S: 'prob-12345' });
                    assert.deepEqual(result.score, { N: '345' });
                    assert.deepEqual(result.values, {
                        M: {
                            widgetId: {
                                S: '"this is a value"'
                            }
                        }
                    });
                    assert.deepEqual(result.variables, {
                        L: [{ M: { authorId: undefined, expectedType: undefined, precision: undefined, text: { S: 'this is text' }, type: undefined } }]
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
                    assert.deepEqual(result.evaluations, source.evaluations);
                    assert.isUndefined(result.feedbackType);
                    assert.isUndefined(result.problemId);
                    assert.isUndefined(result.score);
                    assert.deepEqual(result.values, source.values);
                    assert.deepEqual(result.variables, source.variables);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        evaluations: { otherId: { authorId: { S: 'loggedUserId' }, expected: { S: '3' } } },
                        feedbackType: 'positive',
                        problemId: 'prob-99999',
                        score: 4,
                        values: { otherId: 'serialized data' },
                        variables: [{ text: 'some text', type: 'text' }]
                    };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.evaluations, {
                        otherId: Object.assign(ResponseValidation.getInstance(), {
                            authorId: 'loggedUserId',
                            expected: '3',
                            feedbackType: FeedbackType.POSITIVE,
                            score: 0,
                            strategy: Strategy.EXACT_MATCH
                        })
                    });
                    assert.strictEqual(result.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(result.problemId, 'prob-99999');
                    assert.strictEqual(result.score, 4);
                    assert.deepEqual(result.values, { otherId: 'serialized data' });
                    assert.deepEqual(result.variables, [
                        Object.assign(Variable.getInstance(), { authorId: undefined, id: undefined, text: 'some text', type: 'text' })
                    ]);
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output - I', (): void => {
                    const otherSource: TestModel = TestModel.getInstance();
                    const result: { [key: string]: any } = otherSource.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        feedbackType: undefined,
                        id: undefined,
                        problemId: undefined,
                        score: undefined
                    });
                });
                test('with normal output', (): void => {
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        evaluations: { widgetId: source.evaluations.widgetId.toHttp() },
                        feedbackType: 'neutral',
                        id: undefined,
                        problemId: 'prob-12345',
                        score: 345,
                        values: { widgetId: 'this is a value' },
                        variables: [source.variables[0].toHttp()]
                    });
                });
            }
        );
    }
);

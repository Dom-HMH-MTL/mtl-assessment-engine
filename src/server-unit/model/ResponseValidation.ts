import intern from 'intern';
import { FeedbackType, ResponseValidation, Strategy } from '../../server/model/ResponseValidation';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends ResponseValidation {
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
            assert.deepEqual(ResponseValidation.getInstance(), ResponseValidation.getInstance());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.isUndefined(result.expected);
                    assert.strictEqual(result.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(result.score, 0);
                    assert.strictEqual(result.strategy, Strategy.EXACT_MATCH);
                });
                test('with normal payload', (): void => {
                    const content: { [key: string]: any } = {
                        expected: { S: '000' },
                        feedbackType: { S: 'neutral' },
                        score: { N: '123' },
                        strategy: { S: 'exactOrder' }
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.strictEqual(result.expected, '000');
                    assert.strictEqual(result.feedbackType, FeedbackType.NEUTRAL);
                    assert.strictEqual(result.score, 123);
                    assert.strictEqual(result.strategy, Strategy.EXACT_ORDER);
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
                        expected: undefined,
                        feedbackType: undefined,
                        score: undefined,
                        strategy: undefined
                    });
                });
                test('with normal output', (): void => {
                    source.expected = '34567';
                    source.feedbackType = FeedbackType.NEGATIVE;
                    source.score = -2;
                    source.strategy = Strategy.MATH_EQUIVALENT;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expected: { S: '34567' },
                        feedbackType: { S: 'negative' },
                        score: { N: '-2' },
                        strategy: { S: 'mathEquivalent' }
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
                    assert.isUndefined(result.expected);
                    assert.strictEqual(result.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(result.score, 0);
                    assert.strictEqual(result.strategy, Strategy.EXACT_MATCH);
                });
                test('with normal payload', (): void => {
                    const content: { [key: string]: any } = { expected: '000', feedbackType: 'neutral', score: 123, strategy: 'exactOrder' };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.strictEqual(result.expected, '000');
                    assert.strictEqual(result.feedbackType, FeedbackType.NEUTRAL);
                    assert.strictEqual(result.score, 123);
                    assert.strictEqual(result.strategy, Strategy.EXACT_ORDER);
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output', (): void => {
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expected: undefined,
                        feedbackType: undefined,
                        id: undefined,
                        score: undefined,
                        strategy: undefined
                    });
                });
                test('with default values', (): void => {
                    source.expected = '34567';
                    source.feedbackType = FeedbackType.POSITIVE;
                    source.score = 0;
                    source.strategy = Strategy.EXACT_MATCH;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expected: '34567',
                        id: undefined
                    });
                });
                test('with normal output', (): void => {
                    source.expected = '34567';
                    source.feedbackType = FeedbackType.NEGATIVE;
                    source.score = -2;
                    source.strategy = Strategy.MATH_EQUIVALENT;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        authorId: undefined,
                        expected: '34567',
                        feedbackType: 'negative',
                        id: undefined,
                        score: -2,
                        strategy: 'mathEquivalent'
                    });
                });
            }
        );
    }
);

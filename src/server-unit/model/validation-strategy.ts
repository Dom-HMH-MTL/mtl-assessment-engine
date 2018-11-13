import intern from 'intern';
import { matchers, Strategy, ValidationStrategy } from '../../server/model/validation-strategy';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        suite(
            'matcher',
            (): void => {
                test('ANY', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'some|thing|else'
                    });
                    assert.isTrue(matchers.get(Strategy.ANY)(responseValidation, 'thing'));
                    assert.isFalse(matchers.get(Strategy.ANY)(responseValidation, 'purpose'));
                });
                test('CONTAINS', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'thing'
                    });
                    assert.isTrue(matchers.get(Strategy.CONTAINS)(responseValidation, 'this thing is good'));
                    assert.isFalse(matchers.get(Strategy.CONTAINS)(responseValidation, 'this purpose is good'));
                });
                test('FUZZY_MATCH', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'thing'
                    });
                    assert.isTrue(matchers.get(Strategy.FUZZY_MATCH)(responseValidation, 'THinG'));
                    assert.isFalse(matchers.get(Strategy.FUZZY_MATCH)(responseValidation, 'PurpoSE'));
                });
                test('EXACT_MATCH single value', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'thing'
                    });
                    assert.isTrue(matchers.get(Strategy.EXACT_MATCH)(responseValidation, 'thing'));
                    assert.isFalse(matchers.get(Strategy.EXACT_MATCH)(responseValidation, 'purpose'));
                });
                test('EXACT_MATCH multiple values', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'some|thing|else'
                    });
                    assert.isTrue(matchers.get(Strategy.EXACT_MATCH)(responseValidation, ['some', 'thing', 'else']));
                    assert.isFalse(matchers.get(Strategy.EXACT_MATCH)(responseValidation, ['some', 'purpose', 'else']));
                });
                test('EXACT_ORDER', (): void => {
                    const responseValidation: ValidationStrategy = Object.assign(new ValidationStrategy(), {
                        expected: 'some|thing|else'
                    });
                    assert.isTrue(matchers.get(Strategy.EXACT_ORDER)(responseValidation, ['some', 'thing', 'else']));
                    assert.isFalse(matchers.get(Strategy.EXACT_ORDER)(responseValidation, ['else', 'some', 'thing']));
                });
                test('MATH_EQUIVALENT', (): void => {
                    assert.throws(() => matchers.get(Strategy.MATH_EQUIVALENT)(null, null), 'Feedback strategy not yet implemented: MATH_EQUIVALENT');
                });
            }
        );
    }
);

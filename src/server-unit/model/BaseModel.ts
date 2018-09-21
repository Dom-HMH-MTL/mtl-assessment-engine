import intern from 'intern';
import { BaseModel } from '../../server/model/BaseModel';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends BaseModel {
    public additional: number;
}

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        let source: TestModel;

        beforeEach((): void => {
            source = Object.assign(new TestModel(), { created: 222, id: '111', updated: null } as TestModel);
        });

        afterEach((): void => {
            source = null;
        });

        suite(
            'fromHttp()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.isUndefined(result.id);
                    assert.strictEqual(result.created, 222);
                    assert.isNull(result.updated);
                    assert.isUndefined(result.additional);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = { id: 'aaa', created: 999, updated: 888, additional: 777 };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.strictEqual(result.id, 'aaa');
                    assert.strictEqual(result.created, 999);
                    assert.strictEqual(result.updated, 888);
                    assert.isUndefined(result.additional);
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output', (): void => {
                    delete source.created;
                    delete source.updated;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.strictEqual(result.id, '111');
                    assert.isUndefined(result.created);
                    assert.isUndefined(result.updated);
                });
                test('with maximal output', (): void => {
                    source.updated = 333;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.strictEqual(result.id, '111');
                    assert.strictEqual(result.created, 222);
                    assert.strictEqual(result.updated, 333);
                });
            }
        );
    }
);

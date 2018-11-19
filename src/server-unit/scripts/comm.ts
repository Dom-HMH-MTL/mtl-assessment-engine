import * as fetchMock from 'fetch-mock';
import intern from 'intern';

import { BaseModel } from '../../server/model/BaseModel';
import { httpCreate, httpGet, httpSelect } from '../../server/scripts/comm';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends BaseModel {
    public static getInstance(): TestModel {
        return new TestModel();
    }
    public special: string;
    private constructor() {
        super();
    }
    public fromHttp(content: { [key: string]: any }): TestModel {
        super.fromHttp(content);
        this.special = content.special;
        return this;
    }
    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();
        out.special = out.special;
        return out;
    }
}
const TEST_MODEL_CLASS: TestModel = TestModel.getInstance().constructor as any;
const TEST_MODEL_CLASSNAME: string = TEST_MODEL_CLASS.name;

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        suite(
            'getEntityById()',
            (): void => {
                const url: string = `https://test.com/${TEST_MODEL_CLASSNAME}/12345`;
                const userId: string = 'logged-user-id';
                const expectedOptions: any = {
                    headers: {
                        'X-HMH-User-Id': userId,
                        accept: 'application/json',
                        'content-type': 'application/json'
                    },
                    method: 'GET'
                };
                const matcher: (givenURL: string, givenOptions: any) => boolean = (givenURL: string, givenOptions: any): boolean => {
                    assert.strictEqual(givenURL, url);
                    assert.deepEqual(givenOptions, expectedOptions);
                    return true;
                };

                test('success', async (): Promise<void> => {
                    const providedResponse: any = { status: 200, body: { id: '12345', special: 'whatever' } };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'GET' });

                    const entity: TestModel = (await httpGet(url, userId, TEST_MODEL_CLASS, fetch as any)) as TestModel;
                    assert.strictEqual(entity.id, '12345');
                    assert.strictEqual(entity.special, 'whatever');

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('missing', async (): Promise<void> => {
                    const providedResponse: any = { status: 404 };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'GET' });

                    try {
                        await httpGet(url, userId, TEST_MODEL_CLASS, fetch as any);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Entity of class TestModel for url: https://test.com/TestModel/12345 not found...');
                    }

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('no mock', async (): Promise<void> => {
                    try {
                        await httpGet('', userId, TEST_MODEL_CLASS);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Only absolute URLs are supported');
                    }
                });
            }
        );

        suite(
            'getAllEntities()',
            (): void => {
                const url: string = `https://test.com/${TEST_MODEL_CLASSNAME}/`;
                const userId: string = 'logged-user-id';
                const expectedOptions: any = {
                    headers: {
                        'X-HMH-User-Id': userId,
                        accept: 'application/json',
                        'content-type': 'application/json'
                    },
                    method: 'GET'
                };
                const matcher: (givenURL: string, givenOptions: any) => boolean = (givenURL: string, givenOptions: any): boolean => {
                    assert.strictEqual(givenURL, url);
                    assert.deepEqual(givenOptions, expectedOptions);
                    return true;
                };

                test('success', async (): Promise<void> => {
                    const providedResponse: any = { status: 200, body: [{ id: '12345', special: 'whatever' }] };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'GET' });

                    const entities: TestModel[] = (await httpSelect(url, userId, TEST_MODEL_CLASS, fetch as any)) as TestModel[];
                    assert.strictEqual(entities.length, 1);
                    assert.strictEqual(entities[0].id, '12345');
                    assert.strictEqual(entities[0].special, 'whatever');

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('no result', async (): Promise<void> => {
                    const providedResponse: any = { status: 204, body: [] };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'GET' });

                    const entities: TestModel[] = (await httpSelect(url, userId, TEST_MODEL_CLASS, fetch as any)) as TestModel[];
                    assert.strictEqual(entities.length, 0);

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('missing', async (): Promise<void> => {
                    const providedResponse: any = { status: 404 };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'GET' });

                    try {
                        await httpSelect(url, userId, TEST_MODEL_CLASS, fetch as any);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Entities of class TestModel for url: https://test.com/TestModel/ not found...');
                    }

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('no mock', async (): Promise<void> => {
                    try {
                        await httpSelect('', userId, TEST_MODEL_CLASS);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Only absolute URLs are supported');
                    }
                });
            }
        );

        suite(
            'createEntity()',
            (): void => {
                const url: string = `https://test.com/${TEST_MODEL_CLASSNAME}/`;
                const entity: TestModel = Object.assign(TestModel.getInstance(), { authorId: 'aaa', special: 'whatever' });
                const userId: string = 'logged-user-id';
                const expectedOptions: any = {
                    body: '{"authorId":"aaa"}',
                    headers: {
                        'X-HMH-User-Id': userId,
                        accept: 'application/json',
                        'content-type': 'application/json'
                    },
                    method: 'POST'
                };
                const matcher: (givenURL: string, givenOptions: any) => boolean = (givenURL: string, givenOptions: any): boolean => {
                    assert.strictEqual(givenURL, url);
                    assert.deepEqual(givenOptions, expectedOptions);
                    return true;
                };

                test('success', async (): Promise<void> => {
                    const providedResponse: any = { status: 201, headers: { Location: 'bbb' } };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'POST' });

                    const entityId: string = (await httpCreate(url, entity, userId, fetch as any)) as string;
                    assert.strictEqual(entityId, 'bbb');

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('missing', async (): Promise<void> => {
                    const providedResponse: any = { status: 404 };
                    const fetch: fetchMock.FetchMockSandbox = fetchMock.sandbox().mock(matcher, providedResponse, { method: 'POST' });

                    try {
                        await httpCreate(url, entity, userId, fetch as any);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Creation of entity of class TestModel for url: https://test.com/TestModel/ not found...');
                    }

                    assert.isTrue(fetch.called(url));
                    fetchMock.restore();
                });
                test('no mock', async (): Promise<void> => {
                    try {
                        await httpCreate('', TestModel.getInstance(), userId);
                        assert.fail('Unexpected success');
                    } catch (error) {
                        assert.strictEqual(error.message, 'Only absolute URLs are supported');
                    }
                });
            }
        );
    }
);

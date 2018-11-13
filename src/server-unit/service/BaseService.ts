import intern from 'intern';

import { BaseDao, BaseException } from '@hmh/nodejs-base-server';
import { BaseModel } from '../../server/model/BaseModel';
import { BaseService } from '../../server/service/BaseService';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');
import { SinonStub, stub } from 'sinon';

// tslint:disable: max-classes-per-file
class TestModel extends BaseModel {
    public static getInstance(): TestModel {
        return new TestModel();
    }
}
class TestDao extends BaseDao<TestModel> {
    public static getInstance(): TestDao {
        return new TestDao();
    }
    constructor() {
        super(TestModel.getInstance());
    }
    public async get(id: string): Promise<TestModel> {
        return null;
    }
    public async query(filters: { [key: string]: any }): Promise<TestModel[]> {
        return [];
    }
    public async create(candidate: TestModel): Promise<string> {
        return '';
    }
    public async update(id: string, candidate: TestModel): Promise<string> {
        return '';
    }
    public async delete(id: string): Promise<void> {
        return;
    }
}
class TestService extends BaseService<TestDao> {
    public static getInstance(): TestService {
        return new TestService();
    }
    constructor() {
        super(TestDao.getInstance());
    }
}

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        test('token header name', (): void => {
            assert.strictEqual(TestService.LOGGED_USER_KEY, 'X-HMH-User-Id');
        });

        const unepexted: () => void = (): void => {
            assert.fail('Unexpected success');
        };
        const notAuthorized: (error: BaseException) => void = (error: BaseException): void => {
            assert.strictEqual(error.message, 'Missing authorization token');
            assert.strictEqual(error.errorCode, 401);
        };
        const notAuthor: (error: BaseException) => void = (error: BaseException): void => {
            assert.strictEqual(error.message, 'Only the author can manipulate the entity');
            assert.strictEqual(error.errorCode, 401);
        };

        suite(
            'select()',
            (): void => {
                test('no auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .select(null, null)
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('wrong auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .select(null, { something: 'whatever' })
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('with auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const queryStub: SinonStub = stub(service.dao, 'query');
                    const response: TestModel[] = [];
                    queryStub.withArgs(null).returns(response);

                    assert.strictEqual(await service.select(null, metadata), response);

                    assert.isTrue(queryStub.calledOnce);
                    queryStub.restore();
                });
            }
        );

        suite(
            'get()',
            (): void => {
                test('no auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .get(null, null, null)
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('wrong auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .get(null, null, { something: 'whatever' })
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('with auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const response: TestModel = TestModel.getInstance();
                    getStub.withArgs(null, null).returns(response);

                    assert.strictEqual(await service.get(null, null, metadata), response);

                    assert.isTrue(getStub.calledOnce);
                    getStub.restore();
                });
            }
        );

        suite(
            'create()',
            (): void => {
                test('no auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .create(null, null)
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('wrong auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .create(null, { something: 'whatever' })
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('with auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const createStub: SinonStub = stub(service.dao, 'create');
                    const candidate: TestModel = Object.assign(TestModel.getInstance(), { [authKey]: 'injection attempt' });
                    const response: string = 'just created id';
                    createStub.withArgs(candidate).returns(response);

                    assert.strictEqual(await service.create(candidate, metadata), response);
                    assert.strictEqual(candidate.authorId, 'aaa');

                    assert.isTrue(createStub.calledOnce);
                    createStub.restore();
                });
            }
        );

        suite(
            'update()',
            (): void => {
                test('no auth', async (): Promise<void> => {
                    await TestService.getInstance()
                        .update(null, null, null)
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('wrong auth', async (): Promise<void> => {
                    await TestService.getInstance()
                        .update(null, null, { something: 'whatever' })
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('with author auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'fgthdscv';
                    const entity: TestModel = Object.assign(TestModel.getInstance(), { id, authorId: 'aaa' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private menber
                    const updateStub: SinonStub = stub(service.dao, 'update');
                    updateStub.withArgs(id, entity).returns(id);

                    assert.strictEqual(await service.update(id, entity, metadata), id);
                    assert.isUndefined(entity.authorId);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(updateStub.calledOnce);
                    getStub.restore();
                    updateStub.restore();
                });
                test('with someone else auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'jyhjuikkl';
                    const entity: TestModel = Object.assign(TestModel.getInstance(), { id, authorId: 'bbb' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private menber
                    const updateStub: SinonStub = stub(service.dao, 'update');

                    await service
                        .update(id, entity, metadata)
                        .then(unepexted)
                        .catch(notAuthor);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(updateStub.notCalled);
                    getStub.restore();
                    updateStub.restore();
                });
            }
        );

        suite(
            'delete()',
            (): void => {
                test('no auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .delete(null, null)
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('wrong auth', async (): Promise<void> => {
                    TestService.getInstance()
                        .delete(null, { something: 'whatever' })
                        .then(unepexted)
                        .catch(notAuthorized);
                });
                test('with author auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'fgthdscv';
                    const entity: TestModel = Object.assign(TestModel.getInstance(), { id, authorId: 'aaa' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private menber
                    const deleteStub: SinonStub = stub(service.dao, 'delete');

                    await service.delete(id, metadata);

                    assert.isTrue(getStub.calledOnce);
                    // assert.isTrue(deleteStub.calledOnce);
                    assert.isTrue(deleteStub.calledOnceWithExactly(id));
                    getStub.restore();
                    deleteStub.restore();
                });
                test('with someone else auth token', async (): Promise<void> => {
                    const authKey: string = TestService.LOGGED_USER_KEY;
                    const metadata: { [key: string]: string } = { [authKey]: 'aaa' };
                    const service: TestService = TestService.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'jyhjuikkl';
                    const entity: TestModel = Object.assign(TestModel.getInstance(), { id, authorId: 'bbb' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private menber
                    const deleteStub: SinonStub = stub(service.dao, 'delete');

                    await service
                        .delete(id, metadata)
                        .then(unepexted)
                        .catch(notAuthor);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(deleteStub.notCalled);
                    getStub.restore();
                    deleteStub.restore();
                });
            }
        );
    }
);

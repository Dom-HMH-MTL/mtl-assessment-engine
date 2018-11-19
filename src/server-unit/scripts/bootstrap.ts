import intern from 'intern';

import { Content, CONTENT_CLASS } from '../../server/model/Content';
import { Problem, PROBLEM_CLASS } from '../../server/model/Problem';
import { Processor } from '../../server/scripts/bootstrap';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');
import { SinonStub, stub } from 'sinon';

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        const hostname: string = 'https://test.com/api/v1/Entity';
        const userId: string = 'user@12345';

        test('updateServer()', async (): Promise<void> => {
            const processor: Processor = new Processor();
            // @ts-ignore: access to private method
            const populateContentItemsStub: SinonStub = stub(processor, 'populateContentItems');
            populateContentItemsStub.withArgs(hostname, userId);
            // @ts-ignore: access to private method
            const populateProblemsStub: SinonStub = stub(processor, 'populateProblems');
            populateProblemsStub.withArgs(hostname, userId);

            assert.strictEqual(await processor.updateServer(hostname, userId), processor);

            assert.isTrue(populateContentItemsStub.calledOnce);
            assert.isTrue(populateProblemsStub.calledOnce);
            populateContentItemsStub.restore();
            populateProblemsStub.restore();
        });

        suite(
            'dump()',
            (): void => {
                test('one specific problem', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    const problem: Problem = Problem.getInstance();
                    const problems: { [id: string]: Problem } = { ppp: problem };
                    // @ts-ignore: access to private method
                    const getOneEntityStub: SinonStub = stub(processor, 'getOneEntity');
                    getOneEntityStub.withArgs(hostname + '/api/v1/ang-eng/Problem/ppp?recursiveResolution=true', userId, PROBLEM_CLASS).returns(problem);

                    // @ts-ignore: access to private method
                    assert.deepEqual(await processor.dumpProblems(hostname, userId, problems), [JSON.stringify(problem, null, '  ')]);

                    assert.isTrue(getOneEntityStub.calledOnce);
                    getOneEntityStub.restore();
                });
                test('with list of entities to ppopulate', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    // @ts-ignore: access to private method
                    const getOneEntityStub: SinonStub = stub(processor, 'getOneEntity');
                    getOneEntityStub.returns(Problem.getInstance());

                    // @ts-ignore: access to private method
                    await processor.dumpProblems(hostname, userId);

                    // @ts-ignore: access to private member
                    assert.strictEqual(getOneEntityStub.callCount, Object.keys(processor.PROBLEMS).length);
                    getOneEntityStub.restore();
                });
            }
        );

        test('getOneEntity()', async (): Promise<void> => {
            try {
                // @ts-ignore: access to private method
                await new Processor().getOneEntity('', userId, CONTENT_CLASS);
                assert.fail('Unexpected success');
            } catch (error) {
                assert.strictEqual(error.message, 'Only absolute URLs are supported');
            }
        });

        test('getAllEntities()', async (): Promise<void> => {
            try {
                // @ts-ignore: access to private method
                await new Processor().getAllEntities('', userId, CONTENT_CLASS);
                assert.fail('Unexpected success');
            } catch (error) {
                assert.strictEqual(error.message, 'Only absolute URLs are supported');
            }
        });

        test('createOneEntity()', async (): Promise<void> => {
            try {
                // @ts-ignore: access to private method
                await new Processor().createOneEntity('', Content.getInstance(), userId);
                assert.fail('Unexpected success');
            } catch (error) {
                assert.strictEqual(error.message, 'Only absolute URLs are supported');
            }
        });

        suite(
            'populateContentItems()',
            (): void => {
                const url: string = hostname + '/api/v1/ang-eng/Content';

                test('all already present', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    const itemDefinitions: { [id: string]: any } = {
                        aaa: { descrption: 'bbb', text: { en: '111', fr: '222' }, audioURI: { en: '333', fr: '444' }, type: 'chapter' }
                    };
                    const alreadySavedItem: Content = Content.getInstance().fromHttp({ id: 'aaa' });
                    const alreadySavedItems: Content[] = [alreadySavedItem];
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub.withArgs(url, userId, CONTENT_CLASS).returns(alreadySavedItems);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');

                    // @ts-ignore: access to private method
                    assert.strictEqual(await processor.populateContentItems(hostname, userId, itemDefinitions), alreadySavedItems);

                    assert.isTrue(getAllEntitiesStub.calledOnce);
                    assert.isTrue(createOneEntityStub.notCalled);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
                test('not already present', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    const itemDefinitions: { [id: string]: any } = {
                        aaa: { descrption: 'bbb', text: { en: '111', fr: '222' }, audioURI: { en: '333', fr: '444' }, type: 'chapter' }
                    };
                    const alreadySavedItem: Content = Content.getInstance().fromHttp({ id: 'zzz' });
                    const alreadySavedItems: Content[] = [alreadySavedItem];
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub
                        .withArgs(url, userId, CONTENT_CLASS)
                        .onCall(0)
                        .returns(alreadySavedItems);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');
                    createOneEntityStub.withArgs(url, Content.getInstance().fromHttp(itemDefinitions.aaa), userId).returns('aaa');
                    const justSavedItem: Content = Content.getInstance().fromHttp({ id: 'aaa' });
                    const justSavedItems: Content[] = [justSavedItem];
                    getAllEntitiesStub
                        .withArgs(url, userId, CONTENT_CLASS)
                        .onCall(1)
                        .returns(justSavedItems);

                    // @ts-ignore: access to private method
                    assert.strictEqual(await processor.populateContentItems(hostname, userId, itemDefinitions), justSavedItems);

                    assert.isTrue(getAllEntitiesStub.calledTwice);
                    assert.isTrue(createOneEntityStub.calledOnce);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
                test('with list of entities to ppopulate', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub.returns([]);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');
                    createOneEntityStub.returns('aaa');

                    // @ts-ignore: access to private method
                    await processor.populateContentItems(hostname, userId);

                    assert.isTrue(getAllEntitiesStub.calledTwice);
                    // @ts-ignore: access to private member
                    assert.strictEqual(createOneEntityStub.callCount, Object.keys(processor.CONTENT_ITEMS).length);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
            }
        );

        suite(
            'populateProblems()',
            (): void => {
                const url: string = hostname + '/api/v1/ang-eng/Problem';

                test('all already present', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    const itemDefinitions: { [id: string]: any } = {
                        aaa: { descrption: 'bbb', text: { en: '111', fr: '222' }, audioURI: { en: '333', fr: '444' }, type: 'chapter' }
                    };
                    const alreadySavedItem: Problem = Problem.getInstance().fromHttp({ id: 'aaa' });
                    const alreadySavedItems: Problem[] = [alreadySavedItem];
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub.withArgs(url, userId, PROBLEM_CLASS).returns(alreadySavedItems);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');

                    // @ts-ignore: access to private method
                    assert.strictEqual(await processor.populateProblems(hostname, userId, itemDefinitions), alreadySavedItems);

                    assert.isTrue(getAllEntitiesStub.calledOnce);
                    assert.isTrue(createOneEntityStub.notCalled);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
                test('not already present', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    const itemDefinitions: { [id: string]: any } = {
                        aaa: { descrption: 'bbb', text: { en: '111', fr: '222' }, audioURI: { en: '333', fr: '444' }, type: 'chapter' }
                    };
                    const alreadySavedItem: Problem = Problem.getInstance().fromHttp({ id: 'zzz' });
                    const alreadySavedItems: Problem[] = [alreadySavedItem];
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub
                        .withArgs(url, userId, PROBLEM_CLASS)
                        .onCall(0)
                        .returns(alreadySavedItems);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');
                    createOneEntityStub.withArgs(url, Problem.getInstance().fromHttp(itemDefinitions.aaa), userId).returns('aaa');
                    const justSavedItem: Problem = Problem.getInstance().fromHttp({ id: 'aaa' });
                    const justSavedItems: Problem[] = [justSavedItem];
                    getAllEntitiesStub
                        .withArgs(url, userId, PROBLEM_CLASS)
                        .onCall(1)
                        .returns(justSavedItems);

                    // @ts-ignore: access to private method
                    assert.strictEqual(await processor.populateProblems(hostname, userId, itemDefinitions), justSavedItems);

                    assert.isTrue(getAllEntitiesStub.calledTwice);
                    assert.isTrue(createOneEntityStub.calledOnce);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
                test('with list of entities to ppopulate', async (): Promise<void> => {
                    const processor: Processor = new Processor();
                    // @ts-ignore: access to private method
                    const getAllEntitiesStub: SinonStub = stub(processor, 'getAllEntities');
                    getAllEntitiesStub.returns([]);
                    // @ts-ignore: access to private method
                    const createOneEntityStub: SinonStub = stub(processor, 'createOneEntity');
                    createOneEntityStub.returns('aaa');

                    // @ts-ignore: access to private method
                    await processor.populateProblems(hostname, userId);

                    assert.isTrue(getAllEntitiesStub.calledTwice);
                    // @ts-ignore: access to private member
                    assert.strictEqual(createOneEntityStub.callCount, Object.keys(processor.PROBLEMS).length);
                    getAllEntitiesStub.restore();
                    createOneEntityStub.restore();
                });
            }
        );
    }
);

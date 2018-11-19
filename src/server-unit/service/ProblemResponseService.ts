import intern from 'intern';

import { saveConfig } from '@hmh/nodejs-base-server';
import { Content } from '../../server/model/Content';
import { Problem } from '../../server/model/Problem';
import { ProblemResponse as Model } from '../../server/model/ProblemResponse';
import { FeedbackType, ResponseValidation, Strategy } from '../../server/model/ResponseValidation';
import { ProblemResponseService as Service } from '../../server/service/ProblemResponseService';

import * as appConfig from '../../../src/server/config.json';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');
import { SinonStub, stub } from 'sinon';

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        beforeEach(() => {
            saveConfig(null); // To give a chance for a setup with a new test configuration
            saveConfig({ activeMode: 'dev', dev: { AWS: { DynamoDB: {}, dbTablePrefix: 'ang-eng-' }, NodeServer: {} } });
        });

        afterEach(() => {
            saveConfig(appConfig);
        });

        test('getInstance()', (): void => {
            const service: Service = Service.getInstance();
            assert.isTrue(service instanceof Service);
            assert.strictEqual(Service.getInstance(), service);
            assert.strictEqual(Service.getInstance(), service);
        });

        suite(
            'create()',
            (): void => {
                const id: string = 'polkiuj';
                const authKey: string = Service.LOGGED_USER_KEY;
                const metadata: { [key: string]: string } = { [authKey]: 'aaa' };

                test('nothing to evaluate', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const candidate: Model = Model.getInstance().fromHttp({ problemId: id, values: [], variables: [] });
                    // @ts-ignore: access to private member
                    const getProblemStub: SinonStub = stub(service.associatedService, 'get');
                    const problem: Problem = Problem.getInstance().fromHttp({
                        templateIds: ['1111'],
                        templates: [Content.getInstance().fromHttp({ text: { en: 'this is content' } })]
                    });
                    getProblemStub.withArgs(id, { mode: 'lesson' }, { [authKey]: 'aaa', recursiveResolution: 'true' }).returns(problem);
                    // @ts-ignore: access to private method
                    const getFragmentStub: SinonStub = stub(service, 'getFragment');
                    const fragment: DocumentFragment = {} as DocumentFragment;
                    getFragmentStub.withArgs('this is content').returns(fragment);
                    // @ts-ignore: access to private method
                    const getRespnseValidationsStub: SinonStub = stub(service, 'getRespnseValidations');
                    const validations: Map<string, ResponseValidation[]> = new Map();
                    getRespnseValidationsStub.withArgs(fragment).returns(validations);
                    // @ts-ignore: access to private member
                    const createStub: SinonStub = stub(service.dao, 'create');
                    createStub.withArgs(candidate).returns(id + id);

                    assert.strictEqual(await service.create(candidate, metadata), id + id);
                    assert.deepEqual(candidate.evaluations, {});
                    assert.strictEqual(candidate.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(candidate.score, 0);

                    assert.isTrue(getProblemStub.calledOnce);
                    assert.isTrue(getFragmentStub.calledOnce);
                    assert.isTrue(getRespnseValidationsStub.calledOnce);
                    assert.isTrue(createStub.calledOnce);
                    getProblemStub.restore();
                    getFragmentStub.restore();
                    getRespnseValidationsStub.restore();
                    createStub.restore();
                });

                test('positive and neutral evaluatiosns', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const candidate: Model = Model.getInstance().fromHttp({
                        problemId: id,
                        values: { 'first-interaction': 'neutral-value', 'second-interaction': 'positive-value' },
                        variables: []
                    });
                    // @ts-ignore: access to private member
                    const getProblemStub: SinonStub = stub(service.associatedService, 'get');
                    const problem: Problem = Problem.getInstance().fromHttp({
                        templateIds: ['1111'],
                        templates: [Content.getInstance().fromHttp({ text: { en: 'this is content' } })]
                    });
                    getProblemStub.withArgs(id, { mode: 'lesson' }, { [authKey]: 'aaa', recursiveResolution: 'true' }).returns(problem);
                    // @ts-ignore: access to private method
                    const getFragmentStub: SinonStub = stub(service, 'getFragment');
                    const fragment: DocumentFragment = {} as DocumentFragment;
                    getFragmentStub.withArgs('this is content').returns(fragment);
                    // @ts-ignore: access to private method
                    const getRespnseValidationsStub: SinonStub = stub(service, 'getRespnseValidations');
                    const firstValidation: ResponseValidation = ResponseValidation.getInstance().fromHttp({
                        expected: 'neutral-value',
                        feedbackType: FeedbackType.NEUTRAL,
                        score: 0.5,
                        strategy: Strategy.FUZZY_MATCH
                    });
                    const secondValidation: ResponseValidation = ResponseValidation.getInstance().fromHttp({
                        expected: 'positive-value',
                        feedbackType: FeedbackType.POSITIVE,
                        score: 5,
                        strategy: Strategy.EXACT_MATCH
                    });
                    const validations: Map<string, ResponseValidation[]> = new Map([
                        ['first-interaction', [firstValidation]],
                        ['second-interaction', [secondValidation]]
                    ]);
                    getRespnseValidationsStub.withArgs(fragment).returns(validations);
                    // @ts-ignore: access to private member
                    const createStub: SinonStub = stub(service.dao, 'create');
                    createStub.withArgs(candidate).returns(id + id);

                    assert.strictEqual(await service.create(candidate, metadata), id + id);
                    assert.deepEqual(candidate.evaluations, {
                        'first-interaction': firstValidation,
                        'second-interaction': secondValidation
                    });
                    assert.strictEqual(candidate.feedbackType, FeedbackType.POSITIVE);
                    assert.strictEqual(candidate.score, 5.5);

                    assert.isTrue(getProblemStub.calledOnce);
                    assert.isTrue(getFragmentStub.calledOnce);
                    assert.isTrue(getRespnseValidationsStub.calledOnce);
                    assert.isTrue(createStub.calledOnce);
                    getProblemStub.restore();
                    getFragmentStub.restore();
                    getRespnseValidationsStub.restore();
                    createStub.restore();
                });

                test('negative and default evaluatiosns', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const candidate: Model = Model.getInstance().fromHttp({
                        problemId: id,
                        values: { 'first-interaction': 'negative-value', 'second-interaction': 'default-value' },
                        variables: []
                    });
                    // @ts-ignore: access to private member
                    const getProblemStub: SinonStub = stub(service.associatedService, 'get');
                    const problem: Problem = Problem.getInstance().fromHttp({
                        templateIds: ['1111'],
                        templates: [Content.getInstance().fromHttp({ text: { en: 'this is content' } })]
                    });
                    getProblemStub.withArgs(id, { mode: 'lesson' }, { [authKey]: 'aaa', recursiveResolution: 'true' }).returns(problem);
                    // @ts-ignore: access to private method
                    const getFragmentStub: SinonStub = stub(service, 'getFragment');
                    const fragment: DocumentFragment = {} as DocumentFragment;
                    getFragmentStub.withArgs('this is content').returns(fragment);
                    // @ts-ignore: access to private method
                    const getRespnseValidationsStub: SinonStub = stub(service, 'getRespnseValidations');
                    const firstValidation: ResponseValidation = ResponseValidation.getInstance().fromHttp({
                        // Will fail
                        expected: 'neutral-value',
                        feedbackType: FeedbackType.NEUTRAL,
                        score: 0.5,
                        strategy: Strategy.FUZZY_MATCH
                    });
                    const secondValidation: ResponseValidation = ResponseValidation.getInstance().fromHttp({
                        // Will succeed
                        expected: null,
                        feedbackType: FeedbackType.NEGATIVE,
                        score: -5,
                        strategy: null
                    });
                    const validations: Map<string, ResponseValidation[]> = new Map([
                        ['first-interaction', [firstValidation, secondValidation]],
                        ['second-interaction', []]
                    ]);
                    getRespnseValidationsStub.withArgs(fragment).returns(validations);
                    // @ts-ignore: access to private member
                    const createStub: SinonStub = stub(service.dao, 'create');
                    createStub.withArgs(candidate).returns(id + id);

                    assert.strictEqual(await service.create(candidate, metadata), id + id);
                    const defaultValidation: ResponseValidation = ResponseValidation.getInstance().fromHttp({
                        expected: null,
                        feedbackType: FeedbackType.NEGATIVE,
                        score: 0,
                        strategy: null
                    });
                    assert.deepEqual(candidate.evaluations, {
                        'first-interaction': secondValidation,
                        'second-interaction': defaultValidation
                    });
                    assert.strictEqual(candidate.feedbackType, FeedbackType.NEGATIVE);
                    assert.strictEqual(candidate.score, -5);

                    assert.isTrue(getProblemStub.calledOnce);
                    assert.isTrue(getFragmentStub.calledOnce);
                    assert.isTrue(getRespnseValidationsStub.calledOnce);
                    assert.isTrue(createStub.calledOnce);
                    getProblemStub.restore();
                    getFragmentStub.restore();
                    getRespnseValidationsStub.restore();
                    createStub.restore();
                });
            }
        );

        test('getFragment()', (): void => {
            const service: Service = Service.getInstance();
            // @ts-ignore: access to private method
            const fragment: DocumentFragment = service.getFragment('This is some text');
            assert.strictEqual(fragment.nodeType, fragment.DOCUMENT_FRAGMENT_NODE);
            assert.strictEqual(fragment.firstChild.nodeType, fragment.TEXT_NODE); //
        });

        suite(
            'getRespnseValidations()',
            (): void => {
                test('fragment without <response-validation/> nodes', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const source: string = '';
                    // @ts-ignore: access to private methof
                    const fragment: DocumentFragment = service.getFragment(source);

                    // @ts-ignore: access to private methof
                    const validations: Map<string, ResponseValidation[]> = service.getRespnseValidations(fragment);
                    assert.strictEqual(validations.size, 0);
                });
                test('fragment with <response-validation/> nodes', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const source: string = `
                        <one-container id="first">
                            <response-validation expected="toto" feedback-type="neutral" score="5" strategy="fuzzyMatch">
                                <content-block content-uri="congratulations"></content-block>
                            </response-validation>
                        </one-container>
                        <one-container id="second">
                            <response-validation>
                                <content-block content-uri="trey-again"></content-block>
                            </response-validation>
                        </one-container>
                    `;
                    // @ts-ignore: access to private methof
                    const fragment: DocumentFragment = service.getFragment(source);

                    // @ts-ignore: access to private methof
                    const validations: Map<string, ResponseValidation[]> = service.getRespnseValidations(fragment);
                    assert.strictEqual(validations.size, 2);
                    assert.deepEqual(validations.get('first').length, 1);
                    assert.deepEqual(
                        validations.get('first')[0],
                        ResponseValidation.getInstance().fromHttp({
                            expected: 'toto',
                            feedbackType: FeedbackType.NEUTRAL,
                            score: 5,
                            strategy: Strategy.FUZZY_MATCH
                        })
                    );
                    assert.deepEqual(validations.get('second').length, 1);
                    assert.deepEqual(
                        validations.get('second')[0],
                        ResponseValidation.getInstance().fromHttp({
                            expected: null,
                            feedbackType: FeedbackType.POSITIVE,
                            score: 0,
                            strategy: Strategy.EXACT_MATCH
                        })
                    );
                });
            }
        );
    }
);

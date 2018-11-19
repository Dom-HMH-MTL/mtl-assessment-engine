import intern from 'intern';

import { saveConfig } from '@hmh/nodejs-base-server';
import { Content as Model } from '../../server/model/Content';
import { ContentService as Service } from '../../server/service/ContentService';

import * as appConfig from '../../../src/server/config.json';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');
import { SinonStub, stub } from 'sinon';

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        beforeEach(() => {
            saveConfig(null); // To give a chance for a setup with a new test configuration
            saveConfig({
                activeMode: 'dev',
                dev: {
                    AWS: {
                        DynamoDB: {},
                        dbTablePrefix: 'ang-eng-'
                    },
                    NodeServer: {}
                }
            });
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
                const authKey: string = Service.LOGGED_USER_KEY;
                const metadata: { [key: string]: string } = { [authKey]: 'aaa' };

                test('not processing', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'wsdfsfsdfdsf';
                    const entity: Model = Object.assign(Model.getInstance(), { id, authorId: 'aaa' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private method
                    const filterOutStub: SinonStub = stub(service, 'filterOut');

                    assert.strictEqual(await service.get(id, { mode: 'lesson' }, metadata), entity);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(filterOutStub.notCalled);
                    getStub.restore();
                    filterOutStub.restore();
                });
                test('filtering out', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'wsdfsfsdfdsf';
                    const entity: Model = Object.assign(Model.getInstance(), { id, authorId: 'aaa' });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private method
                    const filterOutStub: SinonStub = stub(service, 'filterOut');
                    filterOutStub.withArgs(entity).returns(entity);

                    assert.strictEqual(await service.get(id, {}, metadata), entity);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(filterOutStub.calledOnce);
                    getStub.restore();
                    filterOutStub.restore();
                });
                test('with automatic resolution', async (): Promise<void> => {
                    const params: { [key: string]: string } = { mode: 'lesson', recursiveResolution: 'true' };
                    const service: Service = Service.getInstance();
                    // @ts-ignore: access to private menber
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const id: string = 'wsdfsfsdfdsf';
                    const entity: Model = Model.getInstance().fromHttp({ id, authorId: 'aaa', text: { en: 'related content id' } });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private method
                    const getFragmentStub: SinonStub = stub(service, 'getFragment');
                    const fragment: DocumentFragment = {} as DocumentFragment;
                    getFragmentStub.withArgs('related content id').returns(fragment);
                    // @ts-ignore: access to private method
                    const fetchRelatedContentStub: SinonStub = stub(service, 'fetchRelatedContent');
                    fetchRelatedContentStub.withArgs(fragment, params, metadata).returns('this included text');
                    // @ts-ignore: access to private method
                    const filterOutStub: SinonStub = stub(service, 'filterOut');

                    assert.strictEqual(await service.get(id, params, metadata), entity);
                    assert.strictEqual(entity.text.en, 'this included text');

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(getFragmentStub.calledOnce);
                    assert.isTrue(fetchRelatedContentStub.calledOnce);
                    assert.isTrue(filterOutStub.notCalled);
                    getStub.restore();
                    getFragmentStub.restore();
                    fetchRelatedContentStub.restore();
                    filterOutStub.restore();
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
            'fetchRelatedContent()',
            (): void => {
                test('with a unsupport node', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const params: { [key: string]: string } = {};
                    const metadata: { [key: string]: string } = {};
                    const firstChild: Node = Object.assign({} as Node, {
                        DOCUMENT_FRAGMENT_NODE: 11,
                        ELEMENT_NODE: 1,
                        TEXT_NODE: 3,
                        nodeType: 333
                    }); // TEXT_NODE
                    const fragment: DocumentFragment = { firstChild } as DocumentFragment;
                    // @ts-ignore: access to private method
                    const getStub: SinonnStub = stub(service, 'get');

                    // @ts-ignore: access to private method
                    assert.strictEqual(await service.fetchRelatedContent(fragment, params, metadata), '-----');

                    assert.isTrue(getStub.notCalled);
                    getStub.restore();
                });
                test('with a text node', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const params: { [key: string]: string } = {};
                    const metadata: { [key: string]: string } = {};
                    const firstChild: Node = Object.assign({} as Node, {
                        DOCUMENT_FRAGMENT_NODE: 11,
                        ELEMENT_NODE: 1,
                        TEXT_NODE: 3,
                        nextSibling: null,
                        nodeType: 3,
                        nodeValue: 'text content'
                    }); // TEXT_NODE
                    const fragment: DocumentFragment = { firstChild } as DocumentFragment;
                    // @ts-ignore: access to private method
                    const getStub: SinonnStub = stub(service, 'get');

                    // @ts-ignore: access to private method
                    assert.strictEqual(await service.fetchRelatedContent(fragment, params, metadata), 'text content');

                    assert.isTrue(getStub.notCalled);
                    getStub.restore();
                });
                test('with content and URI', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const params: { [key: string]: string } = {};
                    const metadata: { [key: string]: string } = {};
                    let contentUriAttributeRemoved: boolean = false;
                    const firstChild: Node = Object.assign({} as Node, {
                        DOCUMENT_FRAGMENT_NODE: 11,
                        ELEMENT_NODE: 1,
                        TEXT_NODE: 3,
                        getAttribute: (name: string): string => {
                            assert.strictEqual(name, 'content-uri');
                            return 'related content id';
                        },
                        nextSibling: null,
                        nodeType: 1, // ELEMENT_NODE
                        outerHTML: '<content>yes</content>',
                        removeAttribute: (name: string): void => {
                            contentUriAttributeRemoved = name === 'content-uri';
                        }
                    });
                    const fragment: DocumentFragment = { firstChild } as DocumentFragment;
                    // @ts-ignore: access to private method
                    const getStub: SinonnStub = stub(service, 'get');
                    getStub.withArgs('related content id', params, metadata).returns({ text: { en: 'yes' } });

                    // @ts-ignore: access to private method
                    assert.strictEqual(await service.fetchRelatedContent(fragment, params, metadata), '<content>yes</content>');
                    assert.isTrue(contentUriAttributeRemoved);
                    assert.strictEqual((firstChild as Element).innerHTML, 'yes');

                    assert.isTrue(getStub.calledOnce);
                    getStub.restore();
                });
                test('with content and without URI', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const params: { [key: string]: string } = {};
                    const metadata: { [key: string]: string } = {};
                    let attributeRemoved: boolean = false;
                    const firstChild: Node = Object.assign({} as Node, {
                        DOCUMENT_FRAGMENT_NODE: 11,
                        ELEMENT_NODE: 1,
                        TEXT_NODE: 3,
                        firstChild: null,
                        getAttribute: (name: string): string => {
                            assert.strictEqual(name, 'content-uri');
                            return '';
                        },
                        nextSibling: null,
                        nodeType: 1, // ELEMENT_NODE
                        outerHTML: '<content></content>',
                        removeAttribute: (name: string): void => {
                            attributeRemoved = name === 'content-uri';
                        }
                    });
                    const fragment: DocumentFragment = { firstChild } as DocumentFragment;
                    // @ts-ignore: access to private method
                    const getStub: SinonnStub = stub(service, 'get');

                    // @ts-ignore: access to private method
                    assert.strictEqual(await service.fetchRelatedContent(fragment, params, metadata), '<content></content>');
                    assert.isFalse(attributeRemoved);

                    assert.isTrue(getStub.notCalled);
                    getStub.restore();
                });
            }
        );

        test('filterOut()', (): void => {
            const service: Service = Service.getInstance();
            const input: Model = Model.getInstance().fromHttp({
                text: {
                    en: '     This is some <response-validation type="text">With content</response-validation> \t\t\t text \n\n '
                }
            });
            // @ts-ignore: access to private method
            assert.strictEqual(service.filterOut(input).text.en, ' This is some text ');
        });
    }
);

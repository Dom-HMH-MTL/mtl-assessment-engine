import intern from 'intern';

import { saveConfig } from '@hmh/nodejs-base-server';
import { Content } from '../../server/model/Content';
import { Problem as Model } from '../../server/model/Problem';
import { ProblemService as Service } from '../../server/service/ProblemService';

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
            'get()',
            (): void => {
                const authKey: string = Service.LOGGED_USER_KEY;
                const metadata: { [key: string]: string } = { [authKey]: 'aaa' };

                test('without resolution', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const id: string = 'dfghyjj';
                    const params: { [key: string]: string } = {};
                    // @ts-ignore: access to private member
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const entity: Model = Model.getInstance();
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private member
                    const getContentStub: SinonStub = stub(service.associatedService, 'get');

                    assert.strictEqual(await service.get(id, params, metadata), entity);

                    assert.isTrue(getStub.calledOnce);
                    assert.isFalse(getContentStub.calledOnce);
                    getStub.restore();
                    getContentStub.restore();
                });
                test('with resolution', async (): Promise<void> => {
                    const service: Service = Service.getInstance();
                    const id: string = 'dfghyjj';
                    const params: { [key: string]: string } = { recursiveResolution: 'true' };
                    // @ts-ignore: access to private member
                    const getStub: SinonStub = stub(service.dao, 'get');
                    const entity: Model = Model.getInstance().fromHttp({ templateIds: ['bbb'] });
                    getStub.withArgs(id).returns(entity);
                    // @ts-ignore: access to private member
                    const getContentStub: SinonStub = stub(service.associatedService, 'get');
                    const content: Content = Content.getInstance().fromHttp({ text: { en: 'this content' } });
                    getContentStub.withArgs('bbb', params, metadata).returns(content);

                    assert.strictEqual(await service.get(id, params, metadata), entity);
                    assert.deepEqual(entity.templates, [content]);

                    assert.isTrue(getStub.calledOnce);
                    assert.isTrue(getContentStub.calledOnce);
                    getStub.restore();
                    getContentStub.restore();
                });
            }
        );
    }
);

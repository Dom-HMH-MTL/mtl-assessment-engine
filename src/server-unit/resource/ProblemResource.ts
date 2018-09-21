import intern from 'intern';

import { saveConfig } from '@hmh/nodejs-base-server';
import { ProblemResource as Resource } from '../../server/resource/ProblemResource';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        beforeEach((): void => {
            saveConfig(null);
            saveConfig({ activeMode: 'test', test: { NodeServer: { cacheControlStrategy: {} } } });
        });
        afterEach((): void => {
            saveConfig(null);
        });

        test('getInstance()', (): void => {
            const resource: Resource = Resource.getInstance();
            assert.isTrue(resource instanceof Resource);
            assert.strictEqual(Resource.getInstance(), resource);
            assert.strictEqual(Resource.getInstance(), resource);
        });
        test('getServiceType()', (): void => {
            const resource: Resource = Resource.getInstance();
            // @ts-ignore: access to protected method
            assert.strictEqual(resource.getServiceType(), 'ang-eng');
        });
    }
);

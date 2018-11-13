import { saveConfig } from '@hmh/nodejs-base-server';
import intern from 'intern';

import { ContentDao as DAO } from '../../server/dao/ContentDao';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        const testConfig: { [key: string]: any } = { activeMode: 'test', test: { AWS: { DynamoDB: {}, dataTablePrefix: 'whatever' } } };

        beforeEach(
            (): void => {
                saveConfig(null);
                saveConfig(testConfig);
            }
        );

        afterEach(
            (): void => {
                saveConfig(null);
            }
        );

        test('getInstance()', (): void => {
            const dao: DAO = DAO.getInstance();
            assert.isTrue(dao instanceof DAO);
            assert.strictEqual(DAO.getInstance(), dao);
            assert.strictEqual(DAO.getInstance(), dao);
        });
    }
);

import intern from 'intern';
import { NotAuthorizedException } from '../../server/exception/NotAuthorizedException';

const { suite, test } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        test('constructor for V8 engine', (): void => {
            const exception: NotAuthorizedException = new NotAuthorizedException('test');
            assert.strictEqual(exception.message, 'test');
            assert.strictEqual(exception.errorCode, 401);
        });
        test('constructor for other JavaScript engines', (): void => {
            const captureFunction: any = Error.captureStackTrace;
            Error.captureStackTrace = null;
            const exception: NotAuthorizedException = new NotAuthorizedException('test');
            assert.strictEqual(exception.message, 'test');
            Error.captureStackTrace = captureFunction;
        });
    }
);

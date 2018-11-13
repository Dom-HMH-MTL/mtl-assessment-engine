import intern from 'intern';
import { Content } from '../../server/model/Content';

const { suite, test, beforeEach, afterEach } = intern.getInterface('tdd');
const { assert } = intern.getPlugin('chai');

class TestModel extends Content {
    public static getInstance(): TestModel {
        return new TestModel();
    }

    public additional: number;
}

suite(
    __filename.substring(__filename.indexOf('/server-unit/') + '/server-unit/'.length),
    (): void => {
        let source: TestModel;

        beforeEach(
            (): void => {
                source = Object.assign(TestModel.getInstance(), {
                    audioURI: { en: '111', fr: '222' },
                    description: 'blah-blah-blah',
                    text: { en: 'this is a template', fr: 'ceci est un modèle' },
                    type: 'chapter'
                });
            }
        );

        afterEach(
            (): void => {
                source = null;
            }
        );

        test('static factory', (): void => {
            assert.deepEqual(Content.getInstance(), Content.getInstance());
        });

        suite(
            'fromDdb()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.audioURI, {});
                    assert.deepEqual(result.text, {});
                    assert.isUndefined(result.type);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = {
                        audioURI: { es: '333' },
                        description: 'directions',
                        text: { es: 'pablo' },
                        type: 'inline'
                    };
                    const result: TestModel = source.fromDdb(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.audioURI, { es: '333' });
                    assert.deepEqual(result.text, { es: 'pablo' });
                    assert.strictEqual(result.type, 'inline');
                    assert.strictEqual(result.description, 'directions');
                });
            }
        );

        suite(
            'toDdb()',
            (): void => {
                test('with minimal output', (): void => {
                    delete source.audioURI;
                    delete source.text;
                    delete source.type;
                    delete source.description;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.isUndefined(result.audioURI);
                    assert.isUndefined(result.text);
                    assert.isUndefined(result.type);
                    assert.isUndefined(result.description);
                });
                test('with short output', (): void => {
                    source.audioURI = {};
                    source.text = {};
                    delete source.type;
                    delete source.description;
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result.audioURI, { M: {} });
                    assert.deepEqual(result.text, { M: {} });
                    assert.isUndefined(result.type);
                    assert.isUndefined(result.description);
                });
                test('with normal output', (): void => {
                    const result: { [key: string]: any } = source.toDdb();
                    assert.deepEqual(result.audioURI, { M: { en: { S: '111' }, fr: { S: '222' } } });
                    assert.deepEqual(result.text, { M: { en: { S: 'this is a template' }, fr: { S: 'ceci est un modèle' } } });
                    assert.deepEqual(result.type, { S: 'chapter' });
                    assert.deepEqual(result.description, { S: 'blah-blah-blah' });
                });
            }
        );

        suite(
            'fromHttp()',
            (): void => {
                test('with empty payload', (): void => {
                    const content: { [key: string]: any } = {};
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.audioURI, source.audioURI);
                    assert.deepEqual(result.text, source.text);
                    assert.isUndefined(result.type);
                    assert.isUndefined(result.description);
                });
                test('with overriding payload', (): void => {
                    const content: { [key: string]: any } = { audioURI: { es: '333' }, text: { es: 'pablo' }, type: 'inline', description: 'directions' };
                    const result: TestModel = source.fromHttp(content) as TestModel;
                    assert.strictEqual(result, source);
                    assert.deepEqual(result.audioURI, { es: '333' });
                    assert.deepEqual(result.text, { es: 'pablo' });
                    assert.strictEqual(result.type, 'inline');
                    assert.strictEqual(result.description, 'directions');
                });
            }
        );

        suite(
            'toHttp()',
            (): void => {
                test('with minimal output - I', (): void => {
                    delete source.audioURI;
                    delete source.text;
                    delete source.type;
                    delete source.description;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: undefined, id: undefined, type: undefined, description: undefined });
                });
                test('with minimal output - II', (): void => {
                    source.audioURI = {};
                    source.text = {};
                    delete source.type;
                    delete source.description;
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, { authorId: undefined, id: undefined, type: undefined, description: undefined });
                });
                test('with normal output', (): void => {
                    const result: { [key: string]: any } = source.toHttp();
                    assert.deepEqual(result, {
                        audioURI: { en: '111', fr: '222' },
                        authorId: undefined,
                        description: 'blah-blah-blah',
                        id: undefined,
                        text: { en: 'this is a template', fr: 'ceci est un modèle' },
                        type: 'chapter'
                    });
                });
            }
        );
    }
);

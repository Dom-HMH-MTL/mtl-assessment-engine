import { DynamoDbDao } from '@hmh/nodejs-base-server';
import * as fs from 'fs';
import { promisify } from 'util';
import { Problem as Model } from '../model/Problem';
import { VariableType } from '../model/Variable';

const readFile = promisify(fs.readFile);

async function fetchTemplate(templateName: string): Promise<string> {
    const content: string = await readFile(`data/templates/${templateName}.html`, 'utf8');
    return content.replace(/\s+/g, ' ');
}

export class ProblemDao extends DynamoDbDao<Model> {
    // Factory method
    public static getInstance(): ProblemDao {
        if (!ProblemDao.instance) {
            ProblemDao.instance = new ProblemDao();
        }
        return ProblemDao.instance;
    }

    private static instance: ProblemDao;

    private constructor() {
        super(Model.getInstance());
    }

    /* istanbul ignore next */
    public async get(id: string, parameters?: { [key: string]: string }): Promise<Model> {
        switch (id) {
            case 'html':
                return Promise.resolve(new Model().fromHttp({ id: '110', template: [await fetchTemplate('html-only')] }));
            case 'oneTextValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: '111',
                        template: [await fetchTemplate('text-one-var')],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'withIntervalValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: '112',
                        template: [await fetchTemplate('text-two-vars')],
                        variables: [
                            { type: VariableType.text, text: 'Raw text, no <b>HTML</b>?' },
                            {
                                maximum: 24,
                                minimum: 12,
                                precision: 0,
                                step: 2,
                                type: VariableType.interval
                            }
                        ]
                    })
                );
            case 'oneTextFieldAndMCQ':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/text-input', '@hmh/multiple-choice'],
                        id: '113',
                        template: [
                            parameters.mode && parameters.mode === 'lesson'
                                ? await fetchTemplate('two-interactions-lesson')
                                : await fetchTemplate('two-interactions-assessment')
                        ],
                        variables: [
                            {
                                maximum: 9,
                                minimum: 3,
                                precision: 0,
                                step: 1,
                                type: VariableType.interval
                            },
                            {
                                maximum: 9,
                                minimum: 2,
                                precision: 0,
                                step: 1,
                                type: VariableType.interval
                            },
                            {
                                expectedType: VariableType.number,
                                expression: '$V[0] * $V[1]',
                                type: VariableType.expression
                            },
                            {
                                expectedType: VariableType.number,
                                expression: '$V[2] % 2 === 0 ? 1 : 0',
                                type: VariableType.expression
                            }
                        ]
                    })
                );
            case 'simpleDragDrop':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id: '114',
                        template: [await fetchTemplate('simple-drag-drop')],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            default:
                return Promise.resolve(new Model().fromHttp({ id: '000', template: ['Hello world!'] }));
        }
    }
}

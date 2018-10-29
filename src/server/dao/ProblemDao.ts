import { DynamoDbDao } from '@hmh/nodejs-base-server';
import * as fs from 'fs';
import { promisify } from 'util';
import { Problem as Model } from '../model/Problem';
import { VariableType } from '../model/Variable';

const readFile = promisify(fs.readFile);

async function fetchTemplate(templateName: string, mode?: string): Promise<string> {
    let content: string;
    if (mode === 'lesson') {
        content = await readFile(`data/problems/${templateName}/template-lesson.html`, 'utf8');
    } else {
        content = await readFile(`data/problems/${templateName}/template.html`, 'utf8');
    }
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
                        template: [await fetchTemplate('two-interactions', parameters.mode)],
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
            case 'dragDropMatching':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id: '114',
                        template: [await fetchTemplate('drag-drop-matching')],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'dragDropSorting':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id: '115',
                        template: [await fetchTemplate('drag-drop-sorting')],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'dragDropDispenser':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id: '116',
                        template: [await fetchTemplate('drag-drop-dispenser')],
                        variables: [
                            {
                                maximum: 3,
                                minimum: 1,
                                precision: 2,
                                step: 0.01,
                                type: VariableType.interval
                            }
                        ]
                    })
                );
            case 'simpleGraph':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/text-input', '@hmh/plot-graph'],
                        id: '117',
                        template: [await fetchTemplate('simple-graph')],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            default:
                return Promise.resolve(new Model().fromHttp({ id: '000', template: ['Hello world!'] }));
        }
    }
}

import * as fs from 'fs';

import { DynamoDbDao } from '@hmh/nodejs-base-server';
import { Problem as Model } from '../model/Problem';
import { VariableType } from '../model/Variable';

function fetchTemplate(templateName: string, mode?: string): string[] {
    // Template of step 0
    const templates: string[] = [];
    templates.push(fs.readFileSync(`data/problems/${templateName}/template.html`, 'utf8'));

    // Additional templates for the following steps, if any
    let templateIndex: number = 1;
    while (fs.existsSync(`data/problems/${templateName}/template-${templateIndex}.html`)) {
        templates.push(fs.readFileSync(`data/problems/${templateName}/template-${templateIndex}.html`, 'utf8'));
        templateIndex += 1;
    }

    return templates;
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
                return Promise.resolve(new Model().fromHttp({ id, template: fetchTemplate('html-only') }));
            case 'oneTextValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id,
                        template: fetchTemplate('text-one-var'),
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'withIntervalValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id,
                        template: fetchTemplate('text-two-vars'),
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
                        id,
                        template: fetchTemplate('two-interactions'),
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
                                expression: '$V[2] % 2 === 0 ? 0 : 1',
                                type: VariableType.expression
                            }
                        ]
                    })
                );
            case 'dragDropMatching':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id,
                        template: fetchTemplate('drag-drop-matching'),
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'dragDropSorting':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id,
                        template: fetchTemplate('drag-drop-sorting'),
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'dragDropDispenser':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/drag-drop'],
                        id,
                        template: fetchTemplate('drag-drop-dispenser'),
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
                        id,
                        template: fetchTemplate('simple-graph'),
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            default:
                return Promise.resolve(new Model().fromHttp({ id, template: ['Hello world!'] }));
        }
    }
}

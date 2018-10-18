import { DynamoDbDao } from '@hmh/nodejs-base-server';
import { Problem as Model } from '../model/Problem';
import { VariableType } from '../model/Variable';

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
                return Promise.resolve(new Model().fromHttp({ id: '110', template: ['<h1>Hello world!</h1><p>Welcome to the Problem runner!</p>'] }));
            case 'oneTextValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: '111',
                        template: ['This is the value: $V[0]'],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'withIntervalValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: '112',
                        template: ['This is a `text` value: $V[0], followed with a randomly picked number within an interval: $V[1]'],
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
            case 'oneTextField':
                return Promise.resolve(
                    new Model().fromHttp({
                        dependencies: ['@hmh/text-input', '@hmh/multiple-choice'],
                        id: '113',
                        template: [
                            `<p>What is the results of $V[0] times $V[1]?</p>
                            <p>
                                <text-input id="ti">
                                    <response-validation hidden slot="feedback" feedback-type="positive" expected="$V[2]" strategy="exactMatch"><span>Youpi</span></response-validation>
                                    <response-validation hidden slot="feedback" feedback-type="negative"><span>Try again</span></response-validation>
                                </text-input>
                            </p>
                            <p>
                                Is the response an odd number?
                                <multiple-choice-question id="mcq" style="display: inline-flex;">
                                    <span hidden slot="options" id="0">Yes</span>
                                    <span hidden slot="options" id="1">No</span>
                                    <span hidden slot="options" id="2">Maybe</span>
                                    <response-validation hidden slot="feedback" feedback-type="positive" expected="$V[3]" strategy="exactMatch"><span>Youpi</span></response-validation>
                                    <response-validation hidden slot="feedback" feedback-type="negative"><span>Try again</span></response-validation>
                                </multiple-choice-question>
                            </p>
                            `
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
                                expression: '$V[2] % 2 === 0 ? 0 : 1',
                                type: VariableType.expression
                            }
                        ]
                    })
                );
            default:
                return Promise.resolve(new Model().fromHttp({ id: '000', template: ['Hello world!'] }));
        }
    }
}

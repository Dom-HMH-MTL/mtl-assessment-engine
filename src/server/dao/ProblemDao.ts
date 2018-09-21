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
            case 'oneTextValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: 'test',
                        template: ['This is the value: $V[0]'],
                        variables: [{ type: VariableType.text, text: 'Hello' }]
                    })
                );
            case 'withIntervalValue':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: 'test',
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
            case 'html':
                return Promise.resolve(
                    new Model().fromHttp({
                        id: 'test',
                        template: ['<h1>Hello world!</h1><p>Welcome to the Problem runner!</p>']
                    })
                );
            default:
                return Promise.resolve(new Model().fromHttp({ id: 'test', template: ['Hello world!'] }));
        }
    }
}

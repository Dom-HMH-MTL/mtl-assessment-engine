import { DynamoDbDao } from '@hmh/nodejs-base-server';
import { Problem as Model } from '../model/Problem';

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
}

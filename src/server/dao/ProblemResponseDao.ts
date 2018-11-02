import { DynamoDbDao } from '@hmh/nodejs-base-server';
import { ProblemResponse as Model } from '../model/ProblemResponse';

export class ProblemResponseDao extends DynamoDbDao<Model> {
    // Factory method
    public static getInstance(): ProblemResponseDao {
        if (!ProblemResponseDao.instance) {
            ProblemResponseDao.instance = new ProblemResponseDao();
        }
        return ProblemResponseDao.instance;
    }

    private static instance: ProblemResponseDao;

    private constructor() {
        super(Model.getInstance());
    }
}

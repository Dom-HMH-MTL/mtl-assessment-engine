import { DynamoDbDao } from '@hmh/nodejs-base-server';
import { Content as Model } from '../model/Content';

export class ContentDao extends DynamoDbDao<Model> {
    // Factory method
    public static getInstance(): ContentDao {
        if (!ContentDao.instance) {
            ContentDao.instance = new ContentDao();
        }
        return ContentDao.instance;
    }

    private static instance: ContentDao;

    private constructor() {
        super(Model.getInstance());
    }
}

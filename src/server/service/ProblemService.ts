import { BaseService } from '@hmh/nodejs-base-server';
import { ProblemDao as DAO } from '../dao/ProblemDao';

export class ProblemService extends BaseService<DAO> {
    public static getInstance(): ProblemService {
        if (!ProblemService.instance) {
            ProblemService.instance = new ProblemService();
        }
        return ProblemService.instance;
    }

    private static instance: ProblemService;

    private constructor() {
        super(DAO.getInstance());
    }
}

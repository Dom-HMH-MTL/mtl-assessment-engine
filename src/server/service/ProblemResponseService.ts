import { BaseService } from '@hmh/nodejs-base-server';
import { ProblemDao as AssociatedDAO } from '../dao/ProblemDao';
import { ProblemResponseDao as DAO } from '../dao/ProblemResponseDao';
import { ProblemResponse as Model } from '../model/ProblemResponse';

import { JSDOM } from 'jsdom';

export class ProblemResponseService extends BaseService<DAO> {
    public static getInstance(): ProblemResponseService {
        if (!ProblemResponseService.instance) {
            ProblemResponseService.instance = new ProblemResponseService();
        }
        return ProblemResponseService.instance;
    }

    private static instance: ProblemResponseService;
    private associatedDao: AssociatedDAO;

    private constructor() {
        super(DAO.getInstance());
        this.associatedDao = AssociatedDAO.getInstance();
    }

    /* istanbul ignore next */
    public async create(candidate: Model): Promise<string> {
        const problem = await this.associatedDao.get(candidate.problemId);
        // TODO: Consider the problem current step...
        const template = JSDOM.fragment(problem.template[0]);
        const validations = this.getRespnseValidations(template);

        // For each node and its <response-validation/> children
        // 1. Evaluate each defined responses (use the right matching algorithm)
        // 2. Check if the given value for the node id does match ones of the just computed responses

        // Return `true` if all given values are validated by a 'positive' response
        return '111-' + problem.id + validations.length;
    }

    private getRespnseValidations(template: any): any[] {
        // Find all nodes which have at least one <response-validation/> child
        // Report the corresponding node identifier and the list of contained <response-validation/> children
        let child = template.firstChild;
        while (child) {
            child = child.nextSibling;
        }
        return [];
    }
}

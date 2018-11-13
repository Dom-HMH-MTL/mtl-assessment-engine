import { ProblemDao as DAO } from '../dao/ProblemDao';
import { Problem as Model } from '../model/Problem';
import { BaseService } from './BaseService';
import { ContentService as AssociatedService } from './ContentService';

export class ProblemService extends BaseService<DAO> {
    public static getInstance(): ProblemService {
        if (!ProblemService.instance) {
            ProblemService.instance = new ProblemService();
        }
        return ProblemService.instance;
    }

    private static instance: ProblemService;
    private associatedService: AssociatedService;

    private constructor() {
        super(DAO.getInstance());
        this.associatedService = AssociatedService.getInstance();
    }

    public async get(id: string, parameters: { [key: string]: string }, metadata: { [key: string]: string }): Promise<Model> {
        const entity: Model = (await super.get(id, parameters, metadata)) as Model;
        if (parameters.recursiveResolution === 'true') {
            entity.templates = [];
            for (const templateId of entity.templateIds) {
                entity.templates.push(await this.associatedService.get(templateId, parameters, metadata));
            }
        }
        return entity;
    }
}

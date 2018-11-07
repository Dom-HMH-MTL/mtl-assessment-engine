import { ProblemDao as DAO } from '../dao/ProblemDao';
import { Problem as Model } from '../model/Problem';
import { BaseService } from './BaseService';

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

    public async get(id: string, parameters: { [key: string]: string } = {}, metadata: { [key: string]: string }): Promise<Model> {
        return super.get(id, parameters, metadata).then((entity: Model): Model => filterOut(entity, parameters));
    }
}

const TOO_MUCH_SPACES_REGEXP: RegExp = /\s+/g;
const RESPONSE_VALIDATION_TAGS_REGEXP: RegExp = /<response-validation.*?<\/response-validation>/g;

function filterOut(entity: Model, parameters: { [key: string]: string } = {}): Model {
    if (parameters.mode !== 'lesson') {
        entity.template = entity.template.map((template: string): string => template.replace(RESPONSE_VALIDATION_TAGS_REGEXP, ''));
    }
    entity.template = entity.template.map((template: string): string => template.replace(TOO_MUCH_SPACES_REGEXP, ' '));

    return entity;
}

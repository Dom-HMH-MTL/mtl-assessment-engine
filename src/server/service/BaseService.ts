import { BaseDao as DAO, BaseService as Service } from '@hmh/nodejs-base-server';
import { NotAuthorizedException } from '../exception/NotAuthorizedException';
import { BaseModel as Model } from '../model/BaseModel';

export class BaseService<T extends DAO<Model>> extends Service<T> {
    public static readonly LOGGED_USER_KEY = 'X-HMH-User-Id';

    protected constructor(dao: T) {
        super(dao);
    }

    public async select(params: { [key: string]: any }, metadata?: { [key: string]: string }): Promise<Model[]> {
        if (!metadata || !metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Missing authorization token');
        }
        return this.dao.query(params);
    }

    public async get(id: string, parameters?: { [key: string]: any }, metadata?: { [key: string]: string }): Promise<Model> {
        if (!metadata || !metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Missing authorization token');
        }
        return this.dao.get(id, parameters);
    }

    public async create(candidate: Model, metadata?: { [key: string]: string }): Promise<string> {
        if (!metadata || !metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Missing authorization token');
        }
        candidate.authorId = metadata[BaseService.LOGGED_USER_KEY]; // To keep track of the owner
        return this.dao.create(candidate);
    }

    public async update(id: string, candidate: Model, metadata?: { [key: string]: string }): Promise<string> {
        if (!metadata || !metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Missing authorization token');
        }
        const model: Model = await this.dao.get(id);
        if (model.authorId !== metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Only the author can manipulate the entity');
        }
        delete candidate.authorId; // To prevent changing the owner
        return this.dao.update(id, candidate);
    }

    public async delete(id: string, metadata?: { [key: string]: string }): Promise<void> {
        if (!metadata || !metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Missing authorization token');
        }
        const model: Model = await this.dao.get(id);
        if (model.authorId !== metadata[BaseService.LOGGED_USER_KEY]) {
            throw new NotAuthorizedException('Only the author can manipulate the entity');
        }
        return this.dao.delete(id);
    }
}

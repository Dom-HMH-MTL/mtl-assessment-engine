import { BaseResource } from '@hmh/nodejs-base-server';
import { ProblemService as Service } from '../service/ProblemService';

export class ProblemResource extends BaseResource<Service> {
    // Factory method
    public static getInstance(): ProblemResource {
        if (!ProblemResource.instance) {
            ProblemResource.instance = new ProblemResource();
        }
        return ProblemResource.instance;
    }

    private static instance: ProblemResource;

    private constructor() {
        super(Service.getInstance());
    }
    protected getServiceType(): string {
        return 'ang-eng';
    }
}

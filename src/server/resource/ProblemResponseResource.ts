import { BaseResource } from '@hmh/nodejs-base-server';
import { ProblemResponseService as Service } from '../service/ProblemResponseService';

export class ProblemResponseResource extends BaseResource<Service> {
    // Factory method
    public static getInstance(): ProblemResponseResource {
        if (!ProblemResponseResource.instance) {
            ProblemResponseResource.instance = new ProblemResponseResource();
        }
        return ProblemResponseResource.instance;
    }

    private static instance: ProblemResponseResource;

    private constructor() {
        super(Service.getInstance());
    }
    protected getServiceType(): string {
        return 'ang-eng';
    }
}

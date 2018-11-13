import { BaseResource } from '@hmh/nodejs-base-server';
import { ContentService as Service } from '../service/ContentService';

export class ContentResource extends BaseResource<Service> {
    // Factory method
    public static getInstance(): ContentResource {
        if (!ContentResource.instance) {
            ContentResource.instance = new ContentResource();
        }
        return ContentResource.instance;
    }

    private static instance: ContentResource;

    private constructor() {
        super(Service.getInstance());
    }
    protected getServiceType(): string {
        return 'ang-eng';
    }
}

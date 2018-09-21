import { DynamoDbModel as Parent } from '@hmh/nodejs-base-server';

export class BaseModel extends Parent {
    public fromHttp(content: { [key: string]: any }): BaseModel {
        this.id = content.id;
        if (content.created !== undefined) {
            this.created = content.created;
        }
        if (content.updated !== undefined) {
            this.updated = content.updated;
        }
        return this;
    }

    public toHttp(): { [key: string]: any } {
        const output: { [key: string]: any } = { id: this.id };
        if (this.created !== undefined) {
            output.created = this.created;
        }
        if (this.updated !== undefined) {
            output.updated = this.updated;
        }
        return output;
    }
}

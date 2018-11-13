import { DynamoDbModel as Parent } from '@hmh/nodejs-base-server';

export class BaseModel extends Parent {
    public authorId: string;

    public fromDdb(content: { [key: string]: any }): BaseModel {
        super.fromDdb(content);
        this.authorId = super.stringFromDdb(content.authorId);
        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();
        out.authorId = super.stringToDdb(this.authorId);
        return out;
    }

    public fromHttp(content: { [key: string]: any }): BaseModel {
        this.id = content.id;
        this.authorId = content.authorId;
        if (content.created !== undefined) {
            this.created = content.created;
        }
        if (content.updated !== undefined) {
            this.updated = content.updated;
        }
        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = { authorId: this.authorId, id: this.id };
        if (this.created !== undefined) {
            out.created = this.created;
        }
        if (this.updated !== undefined) {
            out.updated = this.updated;
        }
        return out;
    }
}

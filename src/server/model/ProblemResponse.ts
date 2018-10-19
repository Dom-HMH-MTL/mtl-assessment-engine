import { BaseModel as Parent } from './BaseModel';
import { Variable } from './Variable';

export class ProblemResponse extends Parent {
    // Factory method
    public static getInstance(): ProblemResponse {
        return new ProblemResponse();
    }

    public problemId: string;
    public variables: Variable[] = [];
    public values: any[] = [];

    public fromDdb(content: { [key: string]: any }): ProblemResponse {
        super.fromDdb(content);

        this.problemId = super.stringFromDdb(content.problemId);
        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => new Variable().fromDdb(super.mapFromDdb(variable)));
        this.value = super.listFromDdb(content.values, []).map((value: any): any => JSON.parse(super.stringFromDdb(value)));

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.problemId = super.stringToDdb(this.problemId, '');
        out.variables = super.listToDdb(this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() })), []);
        out.values = super.listToDdb(this.values.map((value: any): { [key: string]: any } => ({ S: JSON.stringify(value) })), []);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): ProblemResponse {
        super.fromHttp(content);

        this.problemId = content.problemId || '';
        this.variables = (content.variables || []).map((variable: any): Variable => new Variable().fromHttp(variable));
        this.values = (content.values || []).map((value: any): any => JSON.parse(value));

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.problemId = this.problemId;
        if (0 < this.variables.length) {
            out.variables = this.variables.map((variable: Variable) => variable.toHttp());
        }
        if (0 < this.values.length) {
            out.values = this.values.map((value: any) => JSON.stringify(value));
        }

        return out;
    }
}

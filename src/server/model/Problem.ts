import { BaseModel as Parent } from './BaseModel';
import { Variable } from './Variable';

export class Problem extends Parent {
    // Factory method
    public static getInstance(): Problem {
        return new Problem();
    }

    public template: string[] = [];
    public variables: Variable[] = [];

    public fromDdb(content: { [key: string]: any }): Problem {
        super.fromDdb(content);

        this.template = super.listFromDdb(content.template, []).map((statement: string): string => super.stringFromDdb(statement));

        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => new Variable().fromDdb(super.mapFromDdb(variable)));

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        const tempTepmlate: Array<{ [key: string]: any }> = this.template.map((statement: string): { [key: string]: any } => super.stringToDdb(statement));
        out.template = super.listToDdb(tempTepmlate, []);

        const tempVariables: Array<{ [key: string]: any }> = this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() }));
        out.variables = super.listToDdb(tempVariables, []);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): Problem {
        super.fromHttp(content);

        this.template = content.template;

        this.variables = (content.variables || []).map((variable: any): Variable => new Variable().fromHttp(variable));

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.template = this.template;

        if (0 < this.variables.length) {
            out.variables = this.variables.map((variable: Variable) => variable.toHttp());
        }

        return out;
    }
}

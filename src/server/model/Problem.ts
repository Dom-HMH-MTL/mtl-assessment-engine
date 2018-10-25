import { BaseModel as Parent } from './BaseModel';
import { Variable } from './Variable';

export class Problem extends Parent {
    // Factory method
    public static getInstance(): Problem {
        return new Problem();
    }

    public dependencies: string[] = [];
    public styles: string[] = [];
    public template: string[] = [];
    public variables: Variable[] = [];

    public fromDdb(content: { [key: string]: any }): Problem {
        super.fromDdb(content);

        this.dependencies = super.listFromDdb(content.dependencies, []).map((statement: string): string => super.stringFromDdb(statement));
        this.template = super.listFromDdb(content.template, []).map((statement: string): string => super.stringFromDdb(statement));
        this.styles = super.listFromDdb(content.styles, []).map((statement: string): string => super.stringFromDdb(statement));

        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => new Variable().fromDdb(super.mapFromDdb(variable)));

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.dependencies = super.listToDdb(this.dependencies.map((dependency: string): { [key: string]: any } => super.stringToDdb(dependency)), []);
        out.template = super.listToDdb(this.template.map((statement: string): { [key: string]: any } => super.stringToDdb(statement)), []);
        out.styles = super.listToDdb(this.styles.map((statement: string): { [key: string]: any } => super.stringToDdb(statement)), []);

        out.variables = super.listToDdb(this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() })), []);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): Problem {
        super.fromHttp(content);

        this.dependencies = content.dependencies || [];
        this.template = content.template;
        this.styles = content.styles;

        this.variables = (content.variables || []).map((variable: any): Variable => new Variable().fromHttp(variable));

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        if (0 < this.dependencies.length) {
            out.dependencies = this.dependencies;
        }
        out.template = this.template;
        out.styles = this.styles;

        if (0 < this.variables.length) {
            out.variables = this.variables.map((variable: Variable) => variable.toHttp());
        }

        return out;
    }
}

import { BaseModel as Parent } from './BaseModel';
import { Content } from './Content';
import { Variable } from './Variable';

export class Problem extends Parent {
    // Factory method
    public static getInstance(): Problem {
        return new Problem();
    }

    public dependencies: string[] = [];
    public templateIds: string[] = [];
    public templates: Content[];
    public variables: Variable[] = [];

    public fromDdb(content: { [key: string]: any }): Problem {
        super.fromDdb(content);

        this.dependencies = super.listFromDdb(content.dependencies, []).map((statement: string): string => super.stringFromDdb(statement));
        this.templateIds = super.listFromDdb(content.templateIds, []).map((statement: string): string => super.stringFromDdb(statement));
        // this.templates is not serialized

        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => new Variable().fromDdb(super.mapFromDdb(variable)));

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.dependencies = super.listToDdb(this.dependencies.map((dependency: string): { [key: string]: any } => super.stringToDdb(dependency)), []);
        out.templateIds = super.listToDdb(this.templateIds.map((statement: string): { [key: string]: any } => super.stringToDdb(statement)), []);
        // this.templates is not serialized

        out.variables = super.listToDdb(this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() })), []);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): Problem {
        super.fromHttp(content);

        this.dependencies = content.dependencies || [];
        this.templateIds = content.templateIds;
        if (content.templates) {
            this.templates = content.templates.map((template: { [key: string]: any }): Content => new Content().fromHttp(template));
        }

        this.variables = (content.variables || []).map((variable: any): Variable => new Variable().fromHttp(variable));

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        if (0 < this.dependencies.length) {
            out.dependencies = this.dependencies;
        }
        out.templateIds = this.templateIds;
        if (this.templates) {
            out.templates = this.templates.map((template: Content): { [key: string]: any } => template.toHttp());
        }

        if (0 < this.variables.length) {
            out.variables = this.variables.map((variable: Variable) => variable.toHttp());
        }

        return out;
    }
}

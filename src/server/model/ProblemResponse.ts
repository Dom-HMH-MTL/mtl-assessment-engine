import { BaseModel as Parent } from './BaseModel';
import { FeedbackType, ResponseValidation } from './ResponseValidation';
import { Variable } from './Variable';

export class ProblemResponse extends Parent {
    // Factory method
    public static getInstance(): ProblemResponse {
        return new ProblemResponse();
    }

    public problemId: string;
    public variables: Variable[] = [];
    public values: { [key: string]: any } = {};
    public evaluations?: { [key: string]: any } = {};
    public feedbackType?: FeedbackType;
    public score?: number;

    public fromDdb(content: { [key: string]: any }): ProblemResponse {
        super.fromDdb(content);

        this.problemId = super.stringFromDdb(content.problemId);
        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => new Variable().fromDdb(super.mapFromDdb(variable)));
        this.value = super.mapFromDdb(content.values, {}).map((value: any): any => JSON.parse(super.stringFromDdb(value)));
        this.evaluations = super
            .listFromDdb(content.evaluations, [])
            .map((evaluation: any): ResponseValidation => new ResponseValidation().fromDdb(super.mapFromDdb(evaluation)));
        this.feedbackType = super.stringFromDdb(content.feedbackType) as FeedbackType;
        this.score = super.numberFromDdb(content.score);

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.problemId = super.stringToDdb(this.problemId);
        out.variables = super.listToDdb(this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() })), []);
        out.values = super.mapToDdb(this.values.map((value: any): { [key: string]: any } => ({ S: JSON.stringify(value) })), {});
        out.evaluations = super.listToDdb(this.evaluations.map((evaluation: ResponseValidation): { [key: string]: any } => ({ M: evaluation.toDdb() })), []);
        out.feedbackType = super.stringToDdb(this.feedbackType);
        out.score = super.numberToDdb(this.score, 0);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): ProblemResponse {
        super.fromHttp(content);

        this.problemId = content.problemId || '';
        this.variables = (content.variables || []).map((variable: any): Variable => new Variable().fromHttp(variable));
        this.values = content.values || {};
        this.evaluations = (content.evaluations || []).map((evaluation: any): ResponseValidation => new ResponseValidation().fromHttp(evaluation));
        this.feedbackType = content.feedbackType;
        this.score = content.score || 0;

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.problemId = this.problemId;
        if (0 < this.variables.length) {
            out.variables = this.variables.map((variable: Variable) => variable.toHttp());
        }
        if (0 < Object.keys(this.values).length) {
            out.values = this.values;
        }
        if (0 < this.evaluations.length) {
            out.evaluations = this.evaluations.map((evaluation: ResponseValidation) => evaluation.toHttp());
        }
        out.feedbackType = this.feedbackType;
        out.score = this.score;

        return out;
    }
}

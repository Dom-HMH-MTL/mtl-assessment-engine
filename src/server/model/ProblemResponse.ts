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
    public values: { [interactionId: string]: any } = {};
    public evaluations?: { [interactionId: string]: ResponseValidation } = {};
    public feedbackType?: FeedbackType;
    public score?: number;

    protected constructor() {
        super();
    }

    public fromDdb(content: { [key: string]: any }): ProblemResponse {
        super.fromDdb(content);

        this.problemId = super.stringFromDdb(content.problemId);
        this.variables = super.listFromDdb(content.variables, []).map((variable: any): Variable => Variable.getInstance().fromDdb(super.mapFromDdb(variable)));

        if (content.values) {
            const temp: { [interactionId: string]: any } = super.mapFromDdb(content.values);
            for (const interactionId of Object.keys(temp)) {
                temp[interactionId] = JSON.parse(super.stringFromDdb(temp[interactionId]));
            }
            this.values = temp;
        } else {
            this.values = {};
        }
        if (content.evaluations) {
            const temp: { [interactionId: string]: any } = super.mapFromDdb(content.evaluations);
            for (const interactionId of Object.keys(temp)) {
                temp[interactionId] = ResponseValidation.getInstance().fromDdb(super.mapFromDdb(temp[interactionId]));
            }
            this.evaluations = temp;
        } else {
            this.evaluations = {};
        }

        this.feedbackType = super.stringFromDdb(content.feedbackType) as FeedbackType;
        this.score = super.numberFromDdb(content.score);

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.problemId = super.stringToDdb(this.problemId);
        out.variables = super.listToDdb(this.variables.map((variable: Variable): { [key: string]: any } => ({ M: variable.toDdb() })), []);

        if (this.values) {
            const temp: { [interactionId: string]: any } = {};
            for (const interactionId of Object.keys(this.values)) {
                temp[interactionId] = super.stringToDdb(JSON.stringify(this.values[interactionId]));
            }
            out.values = super.mapToDdb(temp);
        }
        if (this.evaluations) {
            const temp: { [interactionId: string]: any } = {};
            for (const interactionId of Object.keys(this.evaluations)) {
                temp[interactionId] = super.mapToDdb(this.evaluations[interactionId].toDdb());
            }
            out.evaluations = super.mapToDdb(temp);
        }

        out.feedbackType = super.stringToDdb(this.feedbackType);
        out.score = super.numberToDdb(this.score, 0);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): ProblemResponse {
        super.fromHttp(content);

        this.problemId = content.problemId;
        this.variables = (content.variables || []).map((variable: any): Variable => Variable.getInstance().fromHttp(variable));
        this.values = content.values || {};
        this.evaluations = {};
        if (content.evaluations) {
            for (const interactionId of Object.keys(content.evaluations)) {
                this.evaluations[interactionId] = ResponseValidation.getInstance().fromDdb(super.mapFromDdb(content.evaluations[interactionId]));
            }
        }
        this.feedbackType = content.feedbackType;
        this.score = content.score;

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
        if (0 < Object.keys(this.evaluations).length) {
            const temp: { [interactionId: string]: any } = {};
            for (const interactionId of Object.keys(this.evaluations)) {
                temp[interactionId] = this.evaluations[interactionId].toHttp();
            }
            out.evaluations = temp;
        }
        out.feedbackType = this.feedbackType;
        out.score = this.score;

        return out;
    }
}

export const PROBLEM_RESPONSE_CLASS: ProblemResponse = ProblemResponse.getInstance().constructor as any;
export const PROBLEM_RESPONSE_CLASS_NAME: string = PROBLEM_RESPONSE_CLASS.name;

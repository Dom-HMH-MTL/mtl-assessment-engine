import { FeedbackType, Strategy } from './validation-strategy';
export { FeedbackType, matchers, Strategy } from './validation-strategy';

import { BaseModel } from './BaseModel';

export class ResponseValidation extends BaseModel {
    // Factory method
    public static getInstance(): ResponseValidation {
        return new ResponseValidation();
    }

    public expected: string;
    public feedbackType: FeedbackType;
    public score: number;
    public strategy: Strategy;

    public fromDdb(content: { [key: string]: any }): ResponseValidation {
        super.fromDdb(content);

        this.expected = super.stringFromDdb(content.expected, null);
        this.feedbackType = super.stringFromDdb(content.feedbackType, FeedbackType.POSITIVE) as FeedbackType;
        this.score = super.numberFromDdb(content.score, 0);
        this.strategy = super.stringFromDdb(content.strategy, Strategy.EXACT_MATCH) as Strategy;

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.expected = super.stringToDdb(this.expected, null);
        out.feedbackType = super.stringToDdb(this.feedbackType as FeedbackType, FeedbackType.POSITIVE);
        out.score = super.numberToDdb(this.score, 0);
        out.strategy = super.stringToDdb(this.strategy as Strategy, Strategy.EXACT_MATCH);

        return out;
    }

    public fromHttp(content: { [key: string]: any }): ResponseValidation {
        super.fromHttp(content);

        this.expected = content.expected || null;
        this.feedbackType = content.feedbackType || FeedbackType.POSITIVE;
        this.score = content.score || 0;
        this.strategy = content.strategy || Strategy.EXACT_MATCH;

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.expected = this.expected;
        if (this.feedbackType !== FeedbackType.POSITIVE) {
            out.feedbackType = this.feedbackType;
        }
        if (this.score !== 0) {
            out.score = this.score;
        }
        if (this.strategy !== Strategy.EXACT_MATCH) {
            out.strategy = this.strategy;
        }

        return out;
    }
}

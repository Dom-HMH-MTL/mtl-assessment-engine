import { BaseModel as Parent } from './BaseModel';

export enum VariableType {
    expression = 'expression',
    interval = 'interval',
    listOrdered = 'listOrdered',
    listRandom = 'listRandom',
    text = 'text'
}

export class Variable extends Parent {
    // Factory method
    public static getInstance(): Variable {
        return new Variable();
    }

    public type: VariableType = VariableType.text;
    public precision: number = 0;
    // text
    public text: string;
    // interval
    public minimum?: number | string;
    public maximum?: number | string;
    public step?: number | string;
    public excludes?: Array<number | string>;
    // listRandom and listRandom
    public valueSet?: Array<number | string>;
    public valueSelector?: number | string;
    // expression
    public expression?: string;

    public fromDdb(content: { [key: string]: any }): Variable {
        super.fromDdb(content);

        this.type = VariableType[super.stringFromDdb(content.type, VariableType[VariableType.text])] as VariableType;
        this.precision = super.numberFromDdb(content.precision, super.stringFromDdb(content.precision, 0)); // No decimal by default

        switch (this.type) {
            case VariableType.interval:
                this.excludes = super
                    .listFromDdb(content.excludes, [])
                    .map((exclude: number | string): number | string => super.numberFromDdb(exclude, super.stringFromDdb(exclude)));
                this.maximum = super.numberFromDdb(content.maximum, super.stringFromDdb(content.maximum));
                this.minimum = super.numberFromDdb(content.minimum, super.stringFromDdb(content.minimum));
                this.step = super.numberFromDdb(content.step, super.stringFromDdb(content.step, 1));
                break;
            default:
                this.text = super.stringFromDdb(content.text, '');
        }

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.type = super.stringToDdb(VariableType[this.type]);
        out.precision = super.numberToDdb(this.precision, 0);

        switch (this.type) {
            case VariableType.interval:
                const tempExcludes: Array<{ [key: string]: any }> = this.excludes.map(
                    (exclude: number | string): { [key: string]: any } =>
                        typeof exclude === 'string' ? super.stringToDdb(exclude) : super.numberToDdb(exclude)
                );
                out.excludes = super.listToDdb(tempExcludes, []);
                out.maximum = typeof this.maximum === 'string' ? super.stringToDdb(this.maximum) : super.numberToDdb(this.maximum);
                out.minimum = typeof this.minimum === 'string' ? super.stringToDdb(this.minimum) : super.numberToDdb(this.minimum);
                out.step = typeof this.step === 'string' ? super.stringToDdb(this.step, 1) : super.numberToDdb(this.step, 1);
                break;
            default:
                out.text = super.stringToDdb(this.text, '');
        }

        return out;
    }

    public fromHttp(content: { [key: string]: any }): Variable {
        super.fromHttp(content);

        this.type = content.type || VariableType.text;
        this.precision = content.precision || 0;

        switch (this.type) {
            case VariableType.interval:
                this.excludes = content.excludes || [];
                this.maximum = content.maximum;
                this.minimum = content.minimum;
                this.step = content.step || 1;
                break;
            default:
                this.text = content.text || '';
        }

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.type = this.type;
        if (this.precision !== 0) {
            out.precision = this.precision;
        }

        switch (this.type) {
            case VariableType.interval:
                if (0 < this.excludes.length) {
                    out.excludes = this.excludes;
                }
                out.maximum = this.maximum;
                out.minimum = this.minimum;
                if (this.step !== 1) {
                    out.step = this.step;
                }
                break;
            default:
                out.text = this.text;
        }

        return out;
    }
}

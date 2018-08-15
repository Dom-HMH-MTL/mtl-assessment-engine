import { DynamoDbModel as Parent } from '@hmh/nodejs-base-server';

export class Problem extends Parent {
    // Factory method
    public static getInstance(): Problem {
        return new Problem();
    }

    public template: string;
}

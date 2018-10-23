import { applyMixins, ComponentBase, Feedback, FeedbackMessage, FeedbackType, html, property, TemplateResult, unsafeHTML } from '@hmh/component-base';
export { ifDefined } from 'lit-html/directives/if-defined';
import { evaluateProblemResponse } from '../app/comm';
import { Problem as Model } from '../model/Problem';
import { prepareStatements } from '../model/ProblemHelpers';
import { ProblemResponse } from '../model/ProblemResponse';

export class ProblemRunner extends ComponentBase<any> {
    @property({ type: Object })
    public entity: Model = null;

    constructor() {
        super();
    }

    public ___dummy() {
        this.showAllFeedbacks(new MouseEvent('click'));
        this.evaluateResponses(new MouseEvent('click'));
    }

    protected shouldUpdate() {
        return this.entity !== null;
    }

    protected render(): TemplateResult {
        this.prepareDependencies();
        return html`
        <link rel="stylesheet" href="/css/theme.css">
        <style>
            #template {
                border: 1px solid grey;
                padding: 4px 20px;
                min-height: 1em;
            }
            #controls {
                display: flex;
                justify-content: space-between;
            }
            #check {
                text-align: right;
            }
        </style>

        <div id="template">${unsafeHTML(this.prepareStatements().join('\n'))}</div>
        <div id="controls">
            <div id="feedback"></div>
            <button id="check" @click="${this.check.bind(this)}">Check</button>
        </div>
        `;
    }

    private async check(event: MouseEvent): Promise<void> {
        // this.showAllFeedbacks(event);
        this.provideOwnFeedback(event);
        // this.evaluateResponses(event).then(
        //     (id: string): void => {
        //         (this as any).shadowRoot.getElementById('feedback').innerText = 'Response saved successfully';
        //     }
        // );
    }

    private async prepareDependencies(): Promise<void> {
        if (this.entity !== null) {
            for (const dependency of this.entity.dependencies) {
                await import('/node_modules/' + dependency + '/dist/index.js');
            }
        }
    }

    private prepareStatements(): string[] {
        if (this.entity === null) {
            return ['No entity assigned to the component yet!'];
        }
        return prepareStatements(this.entity);
    }

    private showAllFeedbacks(event: MouseEvent): void {
        const templadeDiv: HTMLElement = (this as any).shadowRoot.getElementById('template');
        const showFeedbacks = (node: Node): void => {
            if (node instanceof ComponentBase) {
                node.showFeedback();
            } else {
                node.childNodes.forEach((child: Node) => {
                    showFeedbacks(child);
                });
            }
        };
        showFeedbacks(templadeDiv);
    }

    private provideOwnFeedback(event: MouseEvent): void {
        const templadeDiv: HTMLElement = (this as any).shadowRoot.getElementById('template');
        const collectFeedbacks = (node: Node, accumulator: FeedbackMessage[]): FeedbackMessage[] => {
            if (node instanceof ComponentBase) {
                accumulator.push(node.getFeedback());
            } else {
                node.childNodes.forEach((child: Node) => {
                    collectFeedbacks(child, accumulator);
                });
            }
            return accumulator;
        };
        const collectedFeedbacks: FeedbackMessage[] = collectFeedbacks(templadeDiv, []);
        const feedbackDiv: HTMLElement = (this as any).shadowRoot.getElementById('feedback');
        const allPositives: boolean = collectedFeedbacks.reduce(
            (accumulator: boolean, message: FeedbackMessage): boolean => accumulator && message.type === FeedbackType.POSITIVE,
            true
        );
        if (allPositives) {
            feedbackDiv.innerText = 'Everything is OK, ready to move to the next exercize';
            feedbackDiv.className = 'positive';
        } else {
            feedbackDiv.innerText = 'Something is wrong. Please check your answers...';
            feedbackDiv.className = 'negitive';
        }
    }

    private async evaluateResponses(event: MouseEvent): Promise<string> {
        const templadeDiv: HTMLElement = (this as any).shadowRoot.getElementById('template');
        const collectValues = (node: Node, accumulator: any[]): any[] => {
            if (node instanceof ComponentBase) {
                accumulator.push(node.getValue());
            } else {
                node.childNodes.forEach((child: Node) => {
                    collectValues(child, accumulator);
                });
            }
            return accumulator;
        };
        const collectedValues: any[] = collectValues(templadeDiv, []);
        const problemResponse = Object.assign(new ProblemResponse(), { problemId: this.entity.id, variables: this.entity.variables, values: collectedValues });
        return evaluateProblemResponse(problemResponse);
    }
}

applyMixins(ProblemRunner, [Feedback]);

customElements.define('hmh-assess-problem', ProblemRunner);

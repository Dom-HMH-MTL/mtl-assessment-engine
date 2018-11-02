import { applyMixins, ComponentBase, Feedback, FeedbackMessage, FeedbackType, html, property, TemplateResult, unsafeHTML } from '@hmh/component-base';
export { ifDefined } from 'lit-html/directives/if-defined';
import { evaluateProblemResponse } from '../app/comm';
import { Problem as Model } from '../model/Problem';
import { prepareStatements } from '../model/ProblemHelpers';
import { ProblemResponse } from '../model/ProblemResponse';

export class ProblemRunner extends ComponentBase<any> {
    @property({ type: Object })
    public entity: Model = null;
    @property({ type: Boolean })
    public lessonMode: boolean = false;

    constructor() {
        super();
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
            #feedback {
                color: black;
            }
            #feedback.positive {
                color: green;
            }
            #feedback.negative {
                color: red;
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
        if (this.lessonMode) {
            this.showAllFeedbacks(event);
            const { text, className } = this.provideOwnFeedback(event);
            this.displayFeedback(text, className);
        }
        // Always send the problem responses to the back-end service
        this.evaluateResponses(event).then(
            (id: string): void => {
                if (!this.lessonMode) {
                    this.displayFeedback('Response saved successfully', '');
                }
            }
        );
    }

    private displayFeedback(text: string, className: string) {
        const feedbackDiv: HTMLElement = (this as any).shadowRoot.getElementById('feedback');
        feedbackDiv.innerText = text;
        feedbackDiv.className = className;
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
        const showFeedbacks = (node: Node): void => {
            // Stop condition
            if (node instanceof ComponentBase || typeof (node as ComponentBase<any>).showFeedback === 'function') {
                return (node as ComponentBase<any>).showFeedback();
            }
            // Recursive loop (if any `chlid`)
            node.childNodes.forEach((child: Node) => {
                showFeedbacks(child);
            });
        };
        showFeedbacks((this as any).shadowRoot.getElementById('template'));
    }

    private provideOwnFeedback(event: MouseEvent): { text: string; className: string } {
        const collectFeedbacks = (node: Node, accumulator: FeedbackMessage[]): FeedbackMessage[] => {
            // Stop condition
            if (node instanceof ComponentBase || typeof (node as ComponentBase<any>).getFeedback === 'function') {
                accumulator.push((node as ComponentBase<any>).getFeedback());
                return accumulator;
            }
            // Recursive loop (if any `chlid`)
            node.childNodes.forEach((child: Node) => {
                collectFeedbacks(child, accumulator);
            });
            return accumulator;
        };
        const collectedFeedbacks: FeedbackMessage[] = collectFeedbacks((this as any).shadowRoot.getElementById('template'), []);
        const allPositives: boolean = collectedFeedbacks.reduce(
            (accumulator: boolean, message: FeedbackMessage): boolean => accumulator && message.type === FeedbackType.POSITIVE,
            true
        );
        if (allPositives) {
            return {
                className: 'positive',
                text: 'Everything is OK, ready to move to the next exercize'
            };
        }
        return {
            className: 'negative',
            text: 'Something is wrong. Please check your answers...'
        };
    }

    private async evaluateResponses(event: MouseEvent): Promise<string> {
        const collectValues = (node: Node, accumulator: { [id: string]: any }): { [id: string]: any } => {
            // Stop condition
            if (node instanceof ComponentBase || typeof (node as ComponentBase<any>).getValue === 'function') {
                accumulator[(node as Element).id] = (node as ComponentBase<any>).getValue();
                return accumulator;
            }
            // Recursive loop (if any `chlid`)
            node.childNodes.forEach((child: Node) => {
                collectValues(child, accumulator);
            });
            return accumulator;
        };
        const collectedValues: { [id: string]: any } = collectValues((this as any).shadowRoot.getElementById('template'), {});
        const problemResponse = Object.assign(new ProblemResponse(), {
            problemId: this.entity.id,
            values: collectedValues,
            variables: this.entity.variables
        });
        return evaluateProblemResponse(problemResponse);
    }
}

applyMixins(ProblemRunner, [Feedback]);

customElements.define('hmh-assess-problem', ProblemRunner);

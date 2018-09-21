import { html, LitElement, TemplateResult } from '@polymer/lit-element';
import { unsafeHTML } from 'lit-html/lib/unsafe-html';
import { Problem as Model } from '../model/Problem';
import { prepareStatements } from '../model/ProblemHelpers';

export class Problem extends LitElement {
    static get properties(): { [key: string]: string | object } {
        return {
            entity: Object
        };
    }

    // only used for tests compilation: should be inherited from HTMLElement
    public shadowRoot: ShadowRoot;
    public addEventListener: (eventName: string, listener: EventListener) => void;
    public getAttribute: (attr: string) => string;

    public entity: Model = null;

    protected _shouldRender() {
        return this.entity !== null;
    }

    protected _render({ entity }: Problem): TemplateResult {
        return html`
        <style>
            #template {
                border: 1px solid grey;
                min-height: 1em;
            }
            #check {
                float: right;
            }
        </style>

        <div id="template">${unsafeHTML(this.prepareStatements().join('\n'))}</div>
        <button id="check">Check</button>
        `;
    }

    private prepareStatements(): string[] {
        if (this.entity === null) {
            return ['No entity assigned to the component yet!'];
        }
        return prepareStatements(this.entity);
    }
}

customElements.define('hmh-assess-problem', Problem);

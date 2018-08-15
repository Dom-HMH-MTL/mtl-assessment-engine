import { html, LitElement, TemplateResult } from '@polymer/lit-element/lit-element.js';
import { Problem as Model } from '../model/Problem.js';

export class Problem extends LitElement {
    static get properties(): { [key: string]: string | object } {
        return {
            problem: Object
        };
    }

    // only used for tests compilation: should be inherited from HTMLElement
    public shadowRoot: ShadowRoot;
    public addEventListener: (eventName: string, listener: EventListener) => void;
    public getAttribute: (attr: string) => string;

    public problem: Model;

    protected _render({ problem }: Problem): TemplateResult {
        return html`
        ${JSON.stringify(problem)}
        `;
    }
}

customElements.define('hmh-assess-problem', Problem);

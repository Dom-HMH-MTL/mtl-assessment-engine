import { default as fetch, Response } from 'node-fetch';

import { BaseModel } from '../model/BaseModel';
import { Content } from '../model/Content';
import { Problem } from '../model/Problem';
import { VariableType } from '../model/Variable';

const CONTENT_CLASS: Content = new Content().constructor as any;
const PROBLEM_CLASS: Problem = new Problem().constructor as any;

const html = (strings: TemplateStringsArray, ...values: any[]): string => strings.join('');
const CONTENT_ITEMS: { [key: string]: any } = {
    congratulations: {
        text: {
            en: 'Congratulations',
            fr: 'Félicitations'
        },
        type: 'text'
    },
    'try-again': {
        text: {
            en: 'Try again!',
            fr: 'Essaie encore'
        },
        type: 'text'
    },
    'with interval & expression variables, with text-input & mcq interactions': {
        text: {
            en: html`
                <p>
                    What is the results of $V[0] times $V[1]?
                    <text-input id="ti" style="display: inline-flex;">
                        <response-validation hidden slot="feedback" feedback-type="positive" expected="$V[2]" strategy="exactMatch"
                            ><content-block content-uri="congratulations"></content-block
                        ></response-validation>
                        <response-validation hidden slot="feedback" feedback-type="negative"
                            >><content-block content-uri="try-again"></content-block
                        ></response-validation>
                    </text-input>
                </p>
                <p>
                    Is the response an even number?
                    <multiple-choice-question id="mcq" style="display: inline-flex;">
                        <span hidden slot="options" id="0">Yes</span> <span hidden slot="options" id="1">No</span>
                        <span hidden slot="options" id="2">Maybe</span>

                        <response-validation hidden slot="feedback" feedback-type="positive" expected="$V[3]" strategy="exactMatch"
                            ><content-block content-uri="congratulations"></content-block
                        ></response-validation>
                        <response-validation hidden slot="feedback" feedback-type="negative"
                            ><content-block content-uri="try-again"></content-block
                        ></response-validation>
                    </multiple-choice-question>
                </p>
            `
        },
        type: 'problem'
    },
    'with interval variable, with drag-drop dispenser': {
        text: {
            en: html`
                <drag-drop id="dispenser">
                    <h3>The price for a lemonade is $$V[0]</h3>
                    <drag-container dispenser>
                        <img slot="options" src="/images/coin-1.svg" alt="penny" data-value="0.01" />
                        <img slot="options" src="/images/coin-5.svg" alt="nickel" data-value="0.05" />
                        <img slot="options" src="/images/coin-10.svg" alt="dime" data-value="0.1" />
                        <img slot="options" src="/images/coin-25.svg" alt="quarter" data-value="0.25" />
                    </drag-container>
                    <p>Using the coins above, put on the table below the exact amount of money you need to buy a lemonade.</p>
                    <drop-container max-items="20" sticky></drop-container>
                </drag-drop>
            `
        },
        type: 'problem'
    },
    'without variable, with drag-drop matching': {
        text: {
            en: html`
                <drag-drop id="matching" data-interaction swappable>
                    <p>Associate each animal with its name.</p>

                    <article id="drop-zone">
                        <section>
                            <img src="/images/monkey.svg" alt="monkey" />
                            <drop-container id="container1" max-items="1"></drop-container>
                        </section>
                        <section>
                            <img src="/images/mouse.svg" alt="mouse" />
                            <drop-container id="container2" max-items="1"></drop-container>
                        </section>
                        <section>
                            <img src="/images/frog.svg" alt="frog" />
                            <drop-container id="container3" max-items="1"></drop-container>
                        </section>
                    </article>

                    <drag-container>
                        <div slot="options" id="monkey">Monkey</div>
                        <div slot="options" id="frog">Frog</div>
                        <div slot="options" id="mous">Mouse</div>
                    </drag-container>
                </drag-drop>
            `
        },
        type: 'problem'
    },
    'without variable, with drag-drop sorting': {
        text: {
            en: html`
                <h1>The Butterfly Life Cycle</h1>
                <p class="stimulus">
                    Let’s explore a butterfly’s life cycle in detail, including all four stages of life. All butterflies have <b>complete metamorphosis</b>. To
                    grow into an adult they go through 4 stages. Each stage has a different goal - for instance, caterpillars need to eat a lot, and adults need
                    to reproduce. Depending on the type of butterfly, the life cycle of a butterfly may take anywhere from one month to a whole year.
                </p>

                <h3>Can you put the butterfly metamorphosis stages in the correct order?</h3>
                <drag-drop id="sorting">
                    <sortable-drop-container id="sorting">
                        <div slot="options" id="pupa">
                            <figure>
                                <div><img src="/images/butterfly-chrysalis.jpg" /></div>
                                <figcaption>Pupa (Chrysalis)</figcaption>
                            </figure>
                        </div>
                        <div slot="options" id="adult">
                            <figure>
                                <div><img src="/images/butterfly-adult.jpg" /></div>
                                <figcaption>Adult Butterfly</figcaption>
                            </figure>
                        </div>
                        <div slot="options" id="eggs">
                            <figure>
                                <div><img src="/images/butterfly-eggs.jpg" /></div>
                                <figcaption>The Egg</figcaption>
                            </figure>
                        </div>
                        <div slot="options" id="larva">
                            <figure>
                                <div><img src="/images/butterfly-larva.jpg" /></div>
                                <figcaption>The Larva (Caterpillar)</figcaption>
                            </figure>
                        </div>
                    </sortable-drop-container>
                </drag-drop>
            `
        },
        type: 'problem'
    },
    'without variable, with plot-graph': {
        text: {
            en: html`
                <plot-graph>
                    <coordinate-system slot="graph-axis" draw-grid="true">
                        <div slot="axis" direction="x" min="-5" max="5" axis-visibility="visible" scale-visibility="visible" other-axes-crossing-point="0">
                            some label
                        </div>
                        <div slot="axis" direction="y" min="-1" max="3" axis-visibility="visible" scale-visibility="visible" other-axes-crossing-point="0">
                            some label
                        </div>
                    </coordinate-system>
                    <div
                        slot="equation-items"
                        class="equation-item"
                        color="red"
                        equation-xmin="-5"
                        equation-xmax="5"
                        equation-ymin="0"
                        equation-ymax="10"
                        step="1"
                    >
                        0.1 * Math.pow(x,2)
                    </div>
                </plot-graph>
            `
        },
        type: 'problem'
    }
};
const PROBLEMS: { [key: string]: any } = {
    'with interval & expression variables, with text-input & mcq interactions': {
        dependencies: ['@hmh/text-input', '@hmh/multiple-choice'],
        templateIds: ['with interval & expression variables, with text-input & mcq interactions'],
        variables: [
            {
                maximum: 9,
                minimum: 3,
                precision: 0,
                step: 1,
                type: VariableType.interval
            },
            {
                maximum: 9,
                minimum: 2,
                precision: 0,
                step: 1,
                type: VariableType.interval
            },
            {
                expectedType: VariableType.number,
                expression: '$V[0] * $V[1]',
                type: VariableType.expression
            },
            {
                expectedType: VariableType.number,
                expression: '$V[2] % 2 === 0 ? 0 : 1',
                type: VariableType.expression
            }
        ]
    },
    'with interval variable, with drag-drop dispenser': {
        dependencies: ['@hmh/drag-drop'],
        templateIds: ['with interval variable, with drag-drop dispenser'],
        variables: [
            {
                maximum: 3,
                minimum: 1,
                precision: 2,
                step: 0.01,
                type: VariableType.interval
            }
        ]
    },
    'without variable, with drag-drop matching': {
        dependencies: ['@hmh/drag-drop'],
        templateIds: ['without variable, with drag-drop matching']
    },
    'without variable, with drag-drop sorting': {
        dependencies: ['@hmh/drag-drop'],
        templateIds: ['without variable, with drag-drop sorting']
    },
    'without variable, with plot-graph': {
        dependencies: ['@hmh/text-input', '@hmh/plot-graph'],
        templateIds: ['without variable, with plot-graph']
    }
};

export async function getEntityById(url: string, userId: string, modelClass: BaseModel): Promise<BaseModel> {
    return fetch(url, {
        headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId },
        method: 'GET'
    })
        .then(
            async (response: Response): Promise<any> => {
                const status: number = response.status;
                if (status === 200) {
                    return response.json();
                }
                return null;
            }
        )
        .then((data: any): BaseModel => modelClass.getInstance().fromHttp(data));
}

export async function getAllEntities(url: string, userId: string, modelClass: BaseModel): Promise<BaseModel[]> {
    return fetch(url, {
        headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId },
        method: 'GET'
    })
        .then(
            async (response: Response): Promise<any> => {
                const status: number = response.status;
                if (status === 200) {
                    return response.json();
                }
                return null;
            }
        )
        .then(
            (data: any): BaseModel[] => {
                if (Array.isArray(data)) {
                    return data.map((item: any): Content => modelClass.getInstance().fromHttp(item));
                }
                return [];
            }
        );
}

export async function createEntity(url: string, entity: BaseModel, userId: string): Promise<string> {
    return fetch(url, {
        body: JSON.stringify(entity.toHttp()),
        headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId },
        method: 'POST'
    }).then(
        async (response: Response): Promise<any> => {
            const status: number = response.status;
            if (status === 201) {
                return response.headers.get('Location');
            }
            return null;
        }
    );
}

async function populateContentItems(hostname: string, userId: string, items: { [key: string]: any } = CONTENT_ITEMS): Promise<Content[]> {
    const expectedContentItems: Content[] = Object.keys(items).map((key: string): Content => new Content().fromHttp(Object.assign({ id: key }, items[key])));

    const existingContentItems: Content[] = (await getAllEntities(hostname + '/api/v1/ang-eng/Content', userId, CONTENT_CLASS)) as Content[];
    const missingContentItems: Content[] = [];
    for (const expectedItem of expectedContentItems) {
        let expectedItemFound: boolean = false;
        for (const existingItem of existingContentItems) {
            if (existingItem.id === expectedItem.id) {
                expectedItemFound = true;
                break;
            }
        }
        if (!expectedItemFound) {
            missingContentItems.push(expectedItem);
        }
    }
    if (missingContentItems.length === 0) {
        return existingContentItems;
    }

    const pendingCreations: Array<Promise<string>> = missingContentItems.map((content: Content) =>
        createEntity(hostname + '/api/v1/ang-eng/Content', content, userId)
    );
    await Promise.all(pendingCreations);

    return getAllEntities(hostname + '/api/v1/ang-eng/Content', userId, CONTENT_CLASS) as Promise<Content[]>;
}

async function populateProblems(hostname: string, userId: string, items: { [key: string]: any } = PROBLEMS): Promise<Problem[]> {
    const expectedProblemItems: Problem[] = Object.keys(items).map((key: string): Problem => new Problem().fromHttp(Object.assign({ id: key }, items[key])));

    const existingProblemItems: Problem[] = (await getAllEntities(hostname + '/api/v1/ang-eng/Problem', userId, PROBLEM_CLASS)) as Problem[];
    const missingProblemItems: Problem[] = [];
    for (const expectedItem of expectedProblemItems) {
        let expectedItemFound: boolean = false;
        for (const existingItem of existingProblemItems) {
            if (existingItem.id === expectedItem.id) {
                expectedItemFound = true;
                break;
            }
        }
        if (!expectedItemFound) {
            missingProblemItems.push(expectedItem);
        }
    }
    if (missingProblemItems.length === 0) {
        return existingProblemItems;
    }

    const pendingCreations: Array<Promise<string>> = missingProblemItems.map((problem: Problem) =>
        createEntity(hostname + '/api/v1/ang-eng/Problem', problem, userId)
    );
    await Promise.all(pendingCreations);

    return getAllEntities(hostname + '/api/v1/ang-eng/Problem', userId, PROBLEM_CLASS) as Promise<Problem[]>;
}

async function main(hostname: string, userId: string): Promise<void> {
    // Push to the server
    await populateContentItems(hostname, userId);
    await populateProblems(hostname, userId);

    // Test to get a sample
    for (const id of Object.keys(PROBLEMS)) {
        const completeProblem: Problem = (await getEntityById(
            hostname + `/api/v1/ang-eng/Problem/${encodeURI(id).replace(/\//g, '%2f')}?recursiveResolution=true`,
            userId,
            PROBLEM_CLASS
        )) as Problem;
        // tslint:disable-next-line: no-console
        console.log(completeProblem);
    }
}

main(process.argv[2], process.argv[3] || '123');

import { ProblemRunner as Component } from '../component/ProblemRunner';
import { Content } from '../model/Content';
import { Problem } from '../model/Problem';
import { CONTENT_CLASS, loadEntity, PROBLEM_CLASS } from './comm';

function prepareURL(problemId: string): string {
    return '/problem/' + encodeURI(problemId).replace(/\//g, '%2f');
}

export function addLinks(tagetUlId: string): void {
    const links: Array<{ href: string; text: string }> = [
        {
            href: prepareURL('with interval & expression variables, with text-input & mcq interactions') + '?mode=lesson',
            text: 'With an interactive text field (lesson mode)'
        },
        {
            href: prepareURL('with interval & expression variables, with text-input & mcq interactions'),
            text: 'With an interactive text field (assessment mode)'
        },
        { href: prepareURL('without variable, with drag-drop matching') + '?mode=lesson', text: 'Drag and Drop Matching 1-to-1' },
        { href: prepareURL('without variable, with drag-drop sorting') + '?mode=lesson', text: 'Drag and Drop Sorting' },
        { href: prepareURL('with interval variable, with drag-drop dispenser') + '?mode=lesson', text: 'Drag and Drop Dispenser' },
        { href: prepareURL('without variable, with plot-graph') + '?mode=lesson', text: 'Simple 2D graph' }
    ];
    const clickListener: (event: MouseEvent) => void = (event: MouseEvent): void => {
        event.preventDefault();
        const targetLocation: string = (event.target as HTMLAnchorElement).href;
        const newState: any = { location: targetLocation };
        history.pushState(newState, 'HMH Assessment Engine', targetLocation);
        dispatchRoute({ state: newState } as PopStateEvent);
    };

    const list = document.getElementById(tagetUlId);
    for (const link of links) {
        const anchor = document.createElement('a');
        anchor.appendChild(document.createTextNode(link.text));
        anchor.addEventListener('click', clickListener);
        anchor.href = link.href;
        const listItem = document.createElement('li');
        listItem.appendChild(anchor);
        list.appendChild(listItem);
    }
}
export function setupRouter(targetDivId: string): void {
    // Register the route `pop` event listener
    window.onpopstate = dispatchRoute;

    // Update the current page state and forward it to the `dipatchRoute()` method
    const currentLocation: string = window.location.toString();
    const currentState: any = { location: currentLocation };
    history.replaceState(currentState, 'HMH Assessment Engine', currentLocation);
    dispatchRoute({ state: currentState } as PopStateEvent);
}

async function dispatchRoute(event: PopStateEvent): Promise<void> {
    const showcaseDiv = document.getElementById('showcase');
    const currenLocation: URL = new URL(event.state.location);
    const route: string = currenLocation.pathname + currenLocation.search;
    if (route === '/') {
        showcaseDiv.innerHTML = '';
        return;
    }
    if ('/problem/'.length < route.length && route.startsWith('/problem/')) {
        const problemId: string = route.substring('/problem/'.length);
        const entity: Problem = (await loadEntity(problemId, PROBLEM_CLASS)) as Problem;
        if (!entity.templates) {
            entity.templates = [];
            for (const id of entity.templateIds) {
                entity.templates.push((await loadEntity(id, CONTENT_CLASS)) as Content);
            }
        }
        const component: Component = new Component();
        component.entity = entity;
        component.lessonMode = -1 < problemId.indexOf('mode=lesson');
        showcaseDiv.innerHTML = '';
        showcaseDiv.appendChild(component as any);
        return;
    }
    // if ('/assessment'.length ...) {
    //    ...
    //    return;
    // }
}

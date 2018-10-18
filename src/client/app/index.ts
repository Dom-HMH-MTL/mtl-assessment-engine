import { ProblemRunner as Component } from '../component/ProblemRunner';
import { Problem as Model } from '../model/Problem';

async function loadProblem(id: string): Promise<Model> {
    return fetch('/api/v1/ang-eng/Problem/' + id, { headers: { accept: 'application/json' }, method: 'GET' })
        .then((response: Response): any => response.json())
        .then(
            (item: any): Model => {
                return new Model().fromHttp(item);
            }
        );
}

export function addLinks(tagetUlId: string): void {
    const links: Array<{ href: string; text: string }> = [
        { href: '/problem/text', text: 'Just text' },
        { href: '/problem/html', text: 'Basic HTML' },
        { href: '/problem/oneTextValue', text: 'With one text value' },
        { href: '/problem/withIntervalValue', text: 'With interval value' },
        { href: '/problem/oneTextField', text: 'With an interactive text field' }
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
    const route: string = currenLocation.pathname;
    if (route === '/') {
        showcaseDiv.innerHTML = '';
        return;
    }
    if ('/problem/'.length < route.length && route.startsWith('/problem/')) {
        const problemId: string = route.substring('/problem/'.length);
        const component: Component = new Component();
        component.entity = await loadProblem(problemId);
        showcaseDiv.innerHTML = '';
        showcaseDiv.appendChild(component as any);
        return;
    }
    // if ('/assessment'.length ...) {
    //    ...
    //    return;
    // }
}

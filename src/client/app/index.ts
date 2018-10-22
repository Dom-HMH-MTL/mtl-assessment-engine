import { ProblemRunner as Component } from '../component/ProblemRunner';
import { loadProblem } from './comm';

export function addLinks(tagetUlId: string): void {
    const links: Array<{ href: string; text: string }> = [
        { href: '/problem/text?mode=lesson', text: 'Just text' },
        { href: '/problem/html?mode=lesson', text: 'Basic HTML' },
        { href: '/problem/oneTextValue?mode=lesson', text: 'With one text value' },
        { href: '/problem/withIntervalValue?mode=lesson', text: 'With interval value' },
        { href: '/problem/oneTextFieldAndMCQ?mode=lesson', text: 'With an interactive text field (lesson mode)' },
        { href: '/problem/oneTextFieldAndMCQ?mode=assessment', text: 'With an interactive text field (assessment mode)' }
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

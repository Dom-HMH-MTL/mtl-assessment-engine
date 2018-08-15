import { Problem } from '../component/Problem';

export async function displayProblem(divId: string): Promise<void> {
    const problem: Problem = new Problem();
    document.getElementById(divId).appendChild(problem as any);
}

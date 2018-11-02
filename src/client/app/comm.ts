import { Problem } from '../model/Problem';
import { ProblemResponse } from '../model/ProblemResponse';

export async function loadProblem(id: string): Promise<Problem> {
    return fetch('/api/v1/ang-eng/Problem/' + id, { headers: { accept: 'application/json' }, method: 'GET' })
        .then((response: Response): any => response.json())
        .then(
            (model: any): Problem => {
                return new Problem().fromHttp(model);
            }
        );
}

export async function evaluateProblemResponse(model: ProblemResponse): Promise<string> {
    return fetch('/api/v1/ang-eng/ProblemResponse', {
        body: JSON.stringify(model.toHttp()),
        headers: { accept: 'application/json', 'content-type': 'application/json', 'x-hmh-userId': '12345-678-90' },
        method: 'POST'
    }).then(
        (response: Response): string => {
            const status: number = response.status;
            if (status === 201) {
                return response.headers.get('Location');
            }
            return null;
        }
    );
}

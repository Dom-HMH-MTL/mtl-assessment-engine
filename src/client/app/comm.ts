import { BaseModel } from '../model/BaseModel';
import { Content } from '../model/Content';
import { Problem } from '../model/Problem';
import { ProblemResponse } from '../model/ProblemResponse';

export const CONTENT_CLASS: Content = new Content().constructor as any;
export const PROBLEM_CLASS: Problem = new Problem().constructor as any;

function getUserId(): string {
    const inputField: HTMLElement = document.getElementById('hmhUserId');
    return (inputField as HTMLInputElement).value || '12345';
}

export async function loadEntity(id: string, modelClass: BaseModel): Promise<BaseModel> {
    return fetch('/api/v1/ang-eng/' + modelClass.name + '/' + id, {
        headers: { accept: 'application/json', 'X-HMH-User-Id': getUserId() },
        method: 'GET'
    })
        .then((response: Response): any => response.json())
        .then(
            (model: any): Problem => {
                return modelClass.getInstance().fromHttp(model);
            }
        );
}

export async function evaluateProblemResponse(model: ProblemResponse): Promise<string> {
    return fetch('/api/v1/ang-eng/ProblemResponse', {
        body: JSON.stringify(model.toHttp()),
        headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': getUserId() },
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

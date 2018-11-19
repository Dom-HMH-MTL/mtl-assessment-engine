import { BaseModel } from '../model/BaseModel';
import { Problem } from '../model/Problem';

function getUserId(): string {
    const inputField: HTMLElement = document.getElementById('hmhUserId');
    return (inputField as HTMLInputElement).value || '12345';
}

export async function httpGet(id: string, modelClass: BaseModel): Promise<BaseModel> {
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

export async function httpCreate(model: BaseModel): Promise<string> {
    return fetch('/api/v1/ang-eng/' + model.constructor.name, {
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

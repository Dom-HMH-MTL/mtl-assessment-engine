import fetch, { Request, RequestInit, Response } from 'node-fetch';

import { BaseException } from '@hmh/nodejs-base-server';
import { BaseModel } from '../model/BaseModel';

type FetchFunction = (url: string | Request, init?: RequestInit) => Promise<Response>;

export async function httpGet(url: string, userId: string, modelClass: BaseModel, injectedFetch: FetchFunction = fetch): Promise<BaseModel> {
    return injectedFetch(url, { headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId }, method: 'GET' })
        .then(
            async (response: Response): Promise<any> => {
                const status: number = response.status;
                if (status === 200) {
                    return response.json();
                }
                throw Object.assign(new BaseException('Entity of class ' + modelClass.name + ' for url: ' + url + ' not found...'), {
                    errorCode: response.status
                });
            }
        )
        .then((data: any): BaseModel => modelClass.getInstance().fromHttp(data));
}

export async function httpSelect(url: string, userId: string, modelClass: BaseModel, injectedFetch: FetchFunction = fetch): Promise<BaseModel[]> {
    return injectedFetch(url, { headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId }, method: 'GET' })
        .then(
            async (response: Response): Promise<any> => {
                const status: number = response.status;
                if (status === 200) {
                    return response.json();
                }
                if (status === 204) {
                    return [];
                }
                throw Object.assign(new BaseException('Entities of class ' + modelClass.name + ' for url: ' + url + ' not found...'), {
                    errorCode: response.status
                });
            }
        )
        .then(
            (data: any): BaseModel[] => {
                return data.map((item: any): BaseModel => modelClass.getInstance().fromHttp(item));
            }
        );
}

export async function httpCreate(url: string, entity: BaseModel, userId: string, injectedFetch: FetchFunction = fetch): Promise<string> {
    return injectedFetch(url, {
        body: JSON.stringify(entity.toHttp()),
        headers: { accept: 'application/json', 'content-type': 'application/json', 'X-HMH-User-Id': userId },
        method: 'POST'
    }).then(
        async (response: Response): Promise<any> => {
            const status: number = response.status;
            if (status === 201) {
                return response.headers.get('Location');
            }
            throw Object.assign(new BaseException('Creation of entity of class ' + entity.constructor.name + ' for url: ' + url + ' not found...'), {
                errorCode: response.status
            });
        }
    );
}

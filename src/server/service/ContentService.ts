import { ContentDao as DAO } from '../dao/ContentDao';
import { Content as Model } from '../model/Content';
import { BaseService } from './BaseService';

import { JSDOM } from 'jsdom';

const TOO_MUCH_SPACES_REGEXP: RegExp = /\s+/g;
const RESPONSE_VALIDATION_TAGS_REGEXP: RegExp = /<response-validation.*?<\/response-validation>/g;

export class ContentService extends BaseService<DAO> {
    public static getInstance(): ContentService {
        if (!ContentService.instance) {
            ContentService.instance = new ContentService();
        }
        return ContentService.instance;
    }

    private static instance: ContentService;

    private constructor() {
        super(DAO.getInstance());
    }

    public async get(id: string, parameters: { [key: string]: string } = {}, metadata: { [key: string]: string }): Promise<Model> {
        const entity: Model = (await super.get(id, parameters, metadata)) as Model;
        if (parameters.recursiveResolution === 'true') {
            // FIXME: do not only process 'en' language
            const text: DocumentFragment = this.getFragment(entity.text.en);
            // FIXME: do not only process 'en' language
            entity.text.en = await this.fetchRelatedContent(text, parameters, metadata);
        }
        if (parameters.mode === 'lesson') {
            return entity;
        }
        return this.filterOut(entity);
    }
    private getFragment(html: string, jsDomLib: any = JSDOM): DocumentFragment {
        return jsDomLib.fragment(html);
    }

    private async fetchRelatedContent(template: Node, parameters: { [key: string]: string } = {}, metadata: { [key: string]: string }): Promise<string> {
        let child: Element = template.firstChild as Element;
        while (child) {
            if (child.nodeType === child.ELEMENT_NODE) {
                const contentURI: string = child.getAttribute ? child.getAttribute('content-uri') : null;
                if (contentURI) {
                    const relatedContent: Model = await this.get(contentURI, parameters, metadata);
                    // FIXME: do not only process 'en' language
                    child.innerHTML = relatedContent.text.en;
                    child.removeAttribute('content-uri');
                } else {
                    await this.fetchRelatedContent(child, parameters, metadata);
                }
            }
            child = child.nextSibling as Element;
        }
        const fragments: string[] = [];
        child = template.firstChild as Element;
        while (child) {
            switch (child.nodeType) {
                case child.TEXT_NODE:
                    fragments.push(child.nodeValue);
                    break;
                case child.ELEMENT_NODE:
                    fragments.push(child.outerHTML);
                    break;
                default:
                    fragments.push('-----');
            }
            child = child.nextSibling as Element;
        }
        return fragments.join('');
    }

    private filterOut(entity: Model, parameters: { [key: string]: string } = {}): Model {
        // FIXME: do not only process 'en' language
        entity.text.en = entity.text.en.replace(RESPONSE_VALIDATION_TAGS_REGEXP, '').replace(TOO_MUCH_SPACES_REGEXP, ' ');
        return entity;
    }
}

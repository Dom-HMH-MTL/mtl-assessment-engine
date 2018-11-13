import { BaseModel as Parent } from './BaseModel';

export enum Language {
    en = 'en',
    en_US = 'en-US',
    es = 'es',
    es_MX = 'es-MX',
    fr = 'fr',
    fe_CA = 'fr-CA'
}

export class Content extends Parent {
    // Factory method
    public static getInstance(): Content {
        return new Content();
    }

    public type: string;
    public content: { [languageKey: string]: string };
    public audioURI: { [languageKey: string]: string };

    public fromDdb(content: { [key: string]: any }): Content {
        super.fromDdb(content);

        this.type = super.stringFromDdb(content.type);
        if (content.text) {
            const temp: { [language: string]: any } = super.mapFromDdb(content.text);
            for (const language of Object.keys(temp)) {
                temp[language] = super.stringFromDdb(temp[language]);
            }
            this.text = temp;
        } else {
            this.text = {};
        }
        if (content.audioURI) {
            const temp: { [language: string]: any } = super.mapFromDdb(content.audioURI);
            for (const language of Object.keys(temp)) {
                temp[language] = super.stringFromDdb(temp[language]);
            }
            this.audioURI = temp;
        } else {
            this.authorURI = {};
        }

        return this;
    }

    public toDdb(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toDdb();

        out.type = super.stringToDdb(this.type);
        if (this.text) {
            const temp: { [language: string]: any } = {};
            for (const language of Object.keys(this.text)) {
                temp[language] = super.stringToDdb(this.text[language]);
            }
            out.text = super.mapToDdb(temp);
        }
        if (this.audioURL) {
            const temp: { [language: string]: any } = {};
            for (const language of Object.keys(this.audioURL)) {
                temp[language] = super.stringToDdb(this.audioURL[language]);
            }
            out.audioURL = super.mapToDdb(temp);
        }

        return out;
    }

    public fromHttp(content: { [key: string]: any }): Content {
        super.fromHttp(content);

        this.type = content.type;
        this.text = content.text || {};
        this.audioURI = content.audioURI || {};

        return this;
    }

    public toHttp(): { [key: string]: any } {
        const out: { [key: string]: any } = super.toHttp();

        out.type = this.type;
        if (this.text && 0 < Object.keys(this.text).length) {
            out.text = this.text;
        }
        if (this.audioURI && 0 < Object.keys(this.audioURI).length) {
            out.audioURI = this.audioURI;
        }

        return out;
    }
}

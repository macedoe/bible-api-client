import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { Config } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class ConfigService {
    public config: Config = {
        api: {
            baseUrl: ''
        },
        settings: {
            idleTimeOutSeconds: 300,
            alertTimeOutSeconds: 3
        }
    };

    deferredPrompt: any;
    showInstallButton = false;

    constructor(private http: HttpClient) {}

    async loadConfig(): Promise<void> {
        const response = await lastValueFrom(this.http.get<Config>('/config.json'));

        let url = response.api.baseUrl;

        if (url && !url.endsWith('/')) {
            url += '/';
        }

        this.config = {
            api: {
                baseUrl: url
            },
            settings: {
                idleTimeOutSeconds: Number(response.settings.idleTimeOutSeconds),
                alertTimeOutSeconds: Number(response.settings.alertTimeOutSeconds)
            }
        };
    }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
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

    async loadConfig(): Promise<void> {
        let url = environment.api.baseUrl;

        if (url && !url.endsWith('/')) {
            url += '/';
        }

        this.config = {
            api: {
                baseUrl: url
            },
            settings: {
                idleTimeOutSeconds: Number(environment.settings.idleTimeoutSeconds),
                alertTimeOutSeconds: Number(environment.settings.alertTimeoutSeconds)
            }
        };
    }
}

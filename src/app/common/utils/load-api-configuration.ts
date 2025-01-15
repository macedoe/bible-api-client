import { inject } from '@angular/core';
import { ConfigService } from '../services/config.service';

export async function loadApiConfiguration(): Promise<void> {
    const configService = inject(ConfigService);
    return configService.loadConfig();
}

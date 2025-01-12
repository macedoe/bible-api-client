import { ConfigService } from '../services/config.service';

export function loadApiConfiguration(configService: ConfigService): Promise<void> {
    return configService.loadConfig();
}

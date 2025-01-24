import { Component } from '@angular/core';
import { ConfigService } from '../../common/services';
import { ThemeService } from '../../common/services/theme.service';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-about',
    imports: [MaterialModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent {
    constructor(
        public themeService: ThemeService,
        public configService: ConfigService
    ) {}

    installPwa() {
        if (this.configService.deferredPrompt) {
            this.configService.deferredPrompt.prompt();
            this.configService.deferredPrompt.userConfirmed.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt.');
                }
                this.configService.deferredPrompt = null;
            });
        }
    }
}

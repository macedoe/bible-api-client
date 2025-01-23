import { Component, HostListener } from '@angular/core';
import { ThemeService } from '../../common/services/theme.service';
import { MaterialModule } from '../../material.module';

@Component({
    selector: 'app-about',
    imports: [MaterialModule],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent {
    deferredPrompt: any;
    showInstallButton = false;

    constructor(public themeService: ThemeService) {}

    @HostListener('window:beforeinstallprompt', ['$event'])
    onBeforeInstallPrompt(event: Event) {
        event.preventDefault();
        this.deferredPrompt = event;
        this.showInstallButton = true;
    }

    installPwa() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            this.deferredPrompt.userConfirmed.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt.');
                }
                this.deferredPrompt = null;
            });
        }
    }
}

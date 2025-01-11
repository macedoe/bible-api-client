import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FooterComponent, SidenavComponent, TopBarComponent } from './common/components';
import { MaterialModule } from './material.module';

@Component({
    selector: 'app-root',
    imports: [FooterComponent, SidenavComponent, TopBarComponent, RouterOutlet, MaterialModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'test application';
}

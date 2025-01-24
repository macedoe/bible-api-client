import { NgTemplateOutlet } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SidenavService } from '../../common/services';
import { MaterialModule } from '../../material.module';
import { ScriptureService } from './services/scripture.service';

@Component({
    selector: 'app-scripture',
    imports: [FormsModule, ReactiveFormsModule, MaterialModule, NgTemplateOutlet],
    templateUrl: './scripture.component.html',
    styleUrl: './scripture.component.scss'
})
export class ScriptureComponent {
    constructor(
        public scriptureService: ScriptureService,
        private sidenavService: SidenavService
    ) {}

    onToggleSidenav() {
        this.sidenavService.toggle();
    }
}

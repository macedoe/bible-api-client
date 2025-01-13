import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { HomeService } from './services/home.service';

@Component({
    selector: 'app-home',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
    constructor(public homeService: HomeService) {}

    async ngOnInit() {
        if (!this.homeService.bibleTranslations.length) {
            await this.homeService.getTranslations();
            this.homeService.setDefaultTranslationIfAny();
        }
    }
}

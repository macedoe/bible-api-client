import { Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class BibleTitleStrategy extends TitleStrategy {
    constructor() {
        super();
    }

    override updateTitle(snapshot: RouterStateSnapshot): void {
        const title = this.buildTitle(snapshot);
        if (title) {
            document.title = `${title} | Simple Bible Search`;
        }
    }
}

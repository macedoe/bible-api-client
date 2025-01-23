import { Injectable } from '@angular/core';
import { BIBLE_THEME, DARK_THEME, DEFAULT_THEME } from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    isDarkTheme = false;
    theme = DEFAULT_THEME;

    loadTheme() {
        const savedTheme = localStorage.getItem(BIBLE_THEME) || DEFAULT_THEME;
        this.theme = savedTheme;
        this.isDarkTheme = savedTheme === DARK_THEME;
    }

    toggleTheme(theme: 'light' | 'dark') {
        this.isDarkTheme = theme === DARK_THEME;
        localStorage.setItem(BIBLE_THEME, theme);
    }
}

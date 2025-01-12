import { Routes } from '@angular/router';
import { AboutComponent, ForumsComponent, HomeComponent, MessagesComponent } from './features';

export const routes: Routes = [
    { path: '', title: 'App', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'forums', component: ForumsComponent, title: 'Forums' },
    { path: 'messages', component: MessagesComponent, title: 'Messages' },
    { path: 'about', component: AboutComponent, title: 'About' }
];

import { Routes } from '@angular/router';
import { AboutComponent, HomeComponent, MessagesComponent, ScriptureComponent } from './features';

export const routes: Routes = [
    { path: '', title: 'App', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: 'scripture', component: ScriptureComponent, title: 'Scripture' },
    { path: 'messages', component: MessagesComponent, title: 'Messages' },
    { path: 'about', component: AboutComponent, title: 'About' }
];

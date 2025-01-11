import { Routes } from '@angular/router';
import { AboutComponent, ForumsComponent, HomeComponent, MessagesComponent } from './features';

export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'forums', component: ForumsComponent },
    { path: 'messages', component: MessagesComponent },
    { path: 'about', component: AboutComponent }
];

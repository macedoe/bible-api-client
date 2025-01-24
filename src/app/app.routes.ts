import { Routes } from '@angular/router';
import { AboutComponent, HomeComponent, ScriptureComponent } from './features';
import { homeResolver } from './features/home/resolvers/home.resolver';

export const routes: Routes = [
    { path: '', title: 'App', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent, resolve: [homeResolver], title: 'Home' },
    { path: 'scripture', component: ScriptureComponent, title: 'Scripture' },
    { path: 'about', component: AboutComponent, title: 'About' }
];

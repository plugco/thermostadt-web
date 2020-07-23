import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { TabsPage } from './tabs/tabs.page';
import { ActiveTabDirective } from './active-tab.directive';
import { MainPage } from './main/main.page';
import { AppHeaderComponent } from './header.component';
import { OutputsDisplayComponent } from './controls/outputs-display.component';
import { UintEditComponent } from './controls/uint-edit.component';
import { RepconPage } from './repcon/repcon.page';

const routes: Routes = [
    {
        path: 'tab',
        component: TabsPage,
        children: [
            { path: 'main', component: MainPage, },
            { path: 'repcon', component: RepconPage },
            { path: '', redirectTo: '/tab/main', pathMatch: 'full' },
        ]
    },
    { path: '', redirectTo: '/tab/main', pathMatch: 'full' },
];

@NgModule({
    declarations: [
        ActiveTabDirective,
        AppComponent,
        AppHeaderComponent,
        MainPage,
        OutputsDisplayComponent,
        RepconPage,
        TabsPage,
        UintEditComponent,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        FormsModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
    ],
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }

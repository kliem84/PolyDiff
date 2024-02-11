import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { RegistrationPageComponent } from '@app/pages/registration-page/registration-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'create', component: CreationPageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'config', component: ConfigPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'limited', component: LimitedTimePageComponent },
    { path: 'registration', component: RegistrationPageComponent },
    { path: '**', redirectTo: '/login' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}

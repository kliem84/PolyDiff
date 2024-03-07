import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmPasswordPageComponent } from '@app/pages/Confirm-password-page/confirm-password-page.component';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { ChatPageComponent } from '@app/pages/chat-page/chat-page.component';
import { ConfigPageComponent } from '@app/pages/config-page/config-page.component';
import { CreationPageComponent } from '@app/pages/creation-page/creation-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { LimitedTimePageComponent } from '@app/pages/limited-time-page/limited-time-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PersonnalizationPageComponent } from '@app/pages/personnalization-page/personnalization-page.component';
import { ProfilPageComponent } from '@app/pages/profil-page/profil-page.component';
import { RecoverPasswordPageComponent } from '@app/pages/recover-password-page/recover-password-page.component';
import { RegistrationPageComponent } from '@app/pages/registration-page/registration-page.component';
import { SelectionPageComponent } from '@app/pages/selection-page/selection-page.component';
import { AdminGuard } from '@app/services/adminguard/admin.guard.service';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'chat', component: ChatPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'create', component: CreationPageComponent },
    { path: 'selection', component: SelectionPageComponent },
    { path: 'config', component: ConfigPageComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'limited', component: LimitedTimePageComponent },
    { path: 'registration', component: RegistrationPageComponent },
    { path: 'recover-password', component: RecoverPasswordPageComponent },
    { path: 'confirm-password', component: ConfirmPasswordPageComponent },
    { path: 'personalization', component: PersonnalizationPageComponent },
    { path: 'profil', component: ProfilPageComponent },
    { path: 'admin', component: AdminPageComponent, canActivate: [AdminGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}

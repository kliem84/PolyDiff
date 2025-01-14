/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { CommunicationService } from '@app/services/communication-service/communication.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';
import { Account, Credentials } from '@common/game-interfaces';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    loginForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
        password: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    });
    creds: Credentials;
    feedback: string;

    constructor(
        private readonly gameManager: GameManagerService,
        private readonly clientSocket: ClientSocketService,
        private readonly communication: CommunicationService,
        private readonly router: Router,
        private readonly welcomeservice: WelcomeService,
        private translate: TranslateService,
    ) {
        this.feedback = '';
    }

    onSubmit() {
        if (this.loginForm.value.username && this.loginForm.value.password) {
            this.creds = {
                username: this.loginForm.value.username,
                password: this.loginForm.value.password,
            };
            this.communication.login(this.creds).subscribe({
                next: (account: Account) => {
                    this.clientSocket.connect(account.id as string, 'auth');
                    this.welcomeservice.account = account;
                    this.gameManager.username = account.credentials.username;
                    this.translate.setDefaultLang(this.welcomeservice.account.profile.language);
                    this.translate.use(this.welcomeservice.account.profile.language);
                    this.welcomeservice.account.profile.avatar = `http://34.118.163.79:3000/avatar/${this.gameManager.username}.png`;
                    this.router.navigate(['/home']);
                },
                error: (error: HttpErrorResponse) => {
                    this.feedback = error.error || 'An unexpected error occurred. Please try again.';
                },
            });
        }
    }
}

/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { ConnectionEvents } from '@common/enums';

@Component({
    selector: 'app-registration-page',
    templateUrl: './registration-page.component.html',
    styleUrls: ['./registration-page.component.scss'],
})
export class RegistrationPageComponent {
    loginForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
    });

    constructor(
        private readonly gameManager: GameManagerService,
        private readonly clientSocket: ClientSocketService,
        private readonly router: Router,
    ) {}

    onSubmit() {
        if (this.loginForm.value.username && this.loginForm.value.password) {
            this.clientSocket.connect();
            this.clientSocket.on(ConnectionEvents.UserConnectionRequest, (isConnected: boolean) => {
                if (isConnected) {
                    this.router.navigate(['/home']);
                }
            });
            this.gameManager.manageSocket();
            this.clientSocket.send(ConnectionEvents.UserConnectionRequest, this.loginForm.value.username);
            this.clientSocket.send(ConnectionEvents.UserConnectionRequest, this.loginForm.value.password);
            this.gameManager.username = this.loginForm.value.username;
        }
    }
}

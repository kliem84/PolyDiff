/* eslint-disable max-params */
import { Component, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';

@Component({
    selector: 'app-modal-admin',
    templateUrl: './modal-admin.component.html',
    styleUrls: ['./modal-admin.component.scss'],
})
export class ModalAdminComponent {
    @Output() loginEvent = new EventEmitter<string>();

    password: string;
    isPasswordWrong: boolean = false;
    showModal: boolean = false;

    constructor(
        private welcomeService: WelcomeService,
        private router: Router,
        public dialogRef: MatDialogRef<ModalAdminComponent>,
        public clientSocketService: ClientSocketService,
    ) {}

    async onSubmit() {
        this.welcomeService.validate(this.password).then((isValid) => {
            if (isValid) {
                this.isPasswordWrong = false;
                this.clientSocketService.connect(this.welcomeService.account.id as string, 'lobby');
                this.router.navigate(['/admin']);
                this.dialogRef.close();
            } else {
                this.isPasswordWrong = true;
            }
        });
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

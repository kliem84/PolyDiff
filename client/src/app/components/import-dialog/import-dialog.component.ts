import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';

@Component({
    selector: 'app-import-dialog',
    templateUrl: './import-dialog.component.html',
    styleUrls: ['./import-dialog.component.scss'],
})
export class ImportDialogComponent {
    imageData: string;
    constructor(
        public welcomeService: WelcomeService,
        private dialogRef: MatDialogRef<ImportDialogComponent>,
        private clientSocket: ClientSocketService,
    ) {}

    async onFileSelected(event: Event): Promise<void> {
        const inputElement = event.target as HTMLInputElement;
        const selectedFile = inputElement.files?.[0];
        if (selectedFile) {
            const fileReader = new FileReader();
            fileReader.onload = () => {
                const imageBase64 = fileReader.result as string;

                this.imageData = imageBase64;
            };
            fileReader.readAsDataURL(selectedFile);
            this.clientSocket.send('auth', 'send-img', fileReader.result);
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }

    onImport(): void {
        if (this.welcomeService.chooseImage) this.welcomeService.selectAvatar = `http://localhost:3000/default${this.welcomeService.selectLocal}.png`;
        else this.welcomeService.selectAvatar = this.imageData;
        this.dialogRef.close();
    }
    chooseImage(id: string): void {
        this.welcomeService.selectLocal = id;
    }

    setUpColor(id: string): string {
        return this.welcomeService.selectLocal === id ? 'red' : 'white';
    }
}
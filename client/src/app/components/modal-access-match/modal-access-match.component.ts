import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { JoinedPlayerDialogComponent } from '@app/components/joined-player-dialog/joined-player-dialog.component';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { LobbyEvents } from '@common/enums';
import { Lobby } from '@common/game-interfaces';

@Component({
    selector: 'app-modal-access-match',
    templateUrl: './modal-access-match.component.html',
    styleUrls: ['./modal-access-match.component.scss'],
})
export class ModalAccessMatchComponent implements OnInit {
    @Output() loginEvent = new EventEmitter<string>();
    accept: boolean;
    codeAccess: string;
    isPasswordWrong: boolean = false;
    isAccessPassInvalid: boolean = true;

    // eslint-disable-next-line max-params
    constructor(
        // private welcomeService: WelcomeService,
        private router: Router,
        public dialog: MatDialog,
        public dialogRef: MatDialogRef<ModalAccessMatchComponent>,
        public clientSocketService: ClientSocketService,
        public roomManager: RoomManagerService,
        @Inject(MAT_DIALOG_DATA) public lobby: Lobby,
        @Inject(MAT_DIALOG_DATA) public username: string,
    ) {}

    ngOnInit(): void {
        this.clientSocketService.on('lobby', LobbyEvents.RequestAccess, () => {
            this.dialog.open(JoinedPlayerDialogComponent, {
                data: { lobbyId: this.lobby.lobbyId as string, username: this.username },
                disableClose: true,
                panelClass: 'dialog',
            });
        });
        this.clientSocketService.on('lobby', LobbyEvents.NotifyGuest, (isPlayerAccepted: boolean) => {
            if (isPlayerAccepted) {
                this.isAccessPassInvalid = false;
                this.roomManager.joinRoomAcces(this.lobby.lobbyId ? this.lobby.lobbyId : '', this.codeAccess);
                this.router.navigate(['/waiting-room']);
                this.dialog.closeAll();
            }
        });
    }

    onSubmitAccess() {
        if (this.codeAccess === this.lobby.password) {
            this.roomManager.sendRequestToJoinRoom(this.lobby.lobbyId as string, this.lobby.password as string);
            this.dialogRef.close();
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}

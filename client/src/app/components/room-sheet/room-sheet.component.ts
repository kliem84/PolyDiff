/* eslint-disable @angular-eslint/no-empty-lifecycle-method */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalAccessMatchComponent } from '@app/components/modal-access-match/modal-access-match.component';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { Lobby } from '@common/game-interfaces';

@Component({
    selector: 'app-room-sheet',
    templateUrl: './room-sheet.component.html',
    styleUrls: ['./room-sheet.component.scss'],
})
export class RoomSheetComponent {
    @Input() lobby: Lobby;
    gameModes: typeof GameModes = GameModes;

    constructor(
        public router: Router, // private readonly dialog: MatDialog
        public roomManager: RoomManagerService,
        private readonly dialog: MatDialog,
    ) {}

    manageGames(lobby: Lobby): void {
        if (this.lobby.isAvailable && this.lobby.players.length < 4) {
            if (!lobby.password) {
                this.roomManager.joinRoom(lobby.lobbyId ? lobby.lobbyId : '');
                this.router.navigate(['/waiting-room']);
            } else
                this.dialog.open(ModalAccessMatchComponent, {
                    data: lobby,
                });
        } else if (!this.lobby.isAvailable) {
            // rentrer en tant qu'observateur
        }
    }
    feedbackLobby(): string {
        if (this.lobby.players.length === 4) return 'Partie pleine';
        return '';
    }
}

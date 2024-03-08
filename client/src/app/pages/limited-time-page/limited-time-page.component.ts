import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalAccessMatchComponent } from '@app/components/modal-access-match/modal-access-match.component';
import { NoGameAvailableDialogComponent } from '@app/components/no-game-available-dialog/no-game-available-dialog.component';
// import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { GameModes } from '@common/enums';
import { PlayerData } from '@common/game-interfaces';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-limited-time-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
})
export class LimitedTimePageComponent implements OnDestroy, OnInit {
    gameModes: typeof GameModes;
    gameMode: string;
    nPlayersConnected: number;
    private hasNoGameAvailableSubscription: Subscription;
    private roomIdSubscription: Subscription;
    private isLimitedCoopRoomAvailableSubscription: Subscription;
    private playerName: string;
    private isStartingGame: boolean;
    constructor(
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
        private readonly dialog: MatDialog,
        private readonly clientSocket: ClientSocketService,
        private readonly gameManager: GameManagerService,
    ) {
        this.gameModes = GameModes;
        this.isStartingGame = false;
        this.nPlayersConnected = 0;
    }

    ngOnInit(): void {
        this.clientSocket.connect(this.gameManager.username, 'lobby');
        this.roomManagerService.handleRoomEvents();
        // this.openDialog();
        this.handleJoinCoopRoom();
        this.handleNoGameAvailable();
    }

    setGameMode(): void {
        this.roomManagerService.setGameMode('limited');
    }

    manageGames(): void {
        this.dialog.open(ModalAccessMatchComponent);
    }

    playLimited(gameMode: GameModes) {
        if (this.isStartingGame) return;
        this.isStartingGame = true;
        const playerPayLoad = { playerName: this.playerName, gameMode } as PlayerData;
        if (gameMode === GameModes.LimitedSolo) {
            this.roomManagerService.createLimitedRoom(playerPayLoad);
            this.redirectToGamePage(gameMode);
        } else if (gameMode === GameModes.LimitedCoop) {
            this.roomManagerService.checkIfAnyCoopRoomExists(playerPayLoad);
            this.redirectToGamePage(gameMode);
        }
    }

    ngOnDestroy(): void {
        this.clientSocket.disconnect('lobby');
        this.roomIdSubscription?.unsubscribe();
        this.isLimitedCoopRoomAvailableSubscription?.unsubscribe();
        this.hasNoGameAvailableSubscription?.unsubscribe();
        this.roomManagerService.removeAllListeners();
    }

    // private openDialog() {
    //     this.dialog
    //         .open(PlayerNameDialogBoxComponent, { disableClose: true, panelClass: 'dialog' })
    //         .afterClosed()
    //         .subscribe((playerName) => {
    //             if (playerName) {
    //                 this.playerName = playerName;
    //             } else {
    //                 this.router.navigate(['/']);
    //             }
    //         });
    // }

    private redirectToGamePage(gameMode: GameModes) {
        this.roomIdSubscription?.unsubscribe();
        this.roomIdSubscription = this.roomManagerService.roomLimitedId$.pipe(filter((roomId) => !!roomId)).subscribe((roomId) => {
            if (gameMode === GameModes.LimitedSolo) {
                this.router.navigate(['/game']);
            } else if (gameMode === GameModes.LimitedCoop) {
                this.openWaitingDialog(roomId);
                this.isStartingGame = false;
            }
        });
    }

    private openWaitingDialog(roomId: string) {
        this.dialog.open(WaitingForPlayerToJoinComponent, {
            data: { roomId, isLimited: true },
            disableClose: true,
            panelClass: 'dialog',
        });
    }

    private handleJoinCoopRoom() {
        this.isLimitedCoopRoomAvailableSubscription = this.roomManagerService.isLimitedCoopRoomAvailable$
            .pipe(filter((isRoomAvailable) => isRoomAvailable))
            .subscribe(() => {
                this.router.navigate(['/game']);
                this.dialog.closeAll();
            });
    }

    private handleNoGameAvailable() {
        this.hasNoGameAvailableSubscription = this.roomManagerService.hasNoGameAvailable$.subscribe((hasNoGameAvailable) => {
            if (hasNoGameAvailable) this.dialog.open(NoGameAvailableDialogComponent, { disableClose: true, panelClass: 'dialog' });
        });
    }
}

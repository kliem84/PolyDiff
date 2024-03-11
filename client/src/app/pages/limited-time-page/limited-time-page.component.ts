import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ModalAccessMatchComponent } from '@app/components/modal-access-match/modal-access-match.component';
// import { NoGameAvailableDialogComponent } from '@app/components/no-game-available-dialog/no-game-available-dialog.component';
// import { PlayerNameDialogBoxComponent } from '@app/components/player-name-dialog-box/player-name-dialog-box.component';
// import { WaitingForPlayerToJoinComponent } from '@app/components/waiting-player-to-join/waiting-player-to-join.component';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';
import { GameModes } from '@common/enums';
import { Lobby } from '@common/game-interfaces';
// import { PlayerData } from '@common/game-interfaces';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-limited-time-page',
    templateUrl: './limited-time-page.component.html',
    styleUrls: ['./limited-time-page.component.scss'],
})
export class LimitedTimePageComponent implements OnDestroy, OnInit {
    lobbies: Lobby[];
    gameModes: typeof GameModes;
    nPlayersConnected: number;
    private hasNoGameAvailableSubscription: Subscription;
    private roomIdSubscription: Subscription;
    private isLimitedCoopRoomAvailableSubscription: Subscription;
    // private playerName: string;
    // private isStartingGame: boolean;
    constructor(
        public router: Router,
        private readonly roomManagerService: RoomManagerService,
        private readonly dialog: MatDialog,
        private readonly clientSocket: ClientSocketService,
        private readonly welcomeService: WelcomeService,
    ) {
        this.gameModes = GameModes;
        // this.isStartingGame = false;
        this.nPlayersConnected = 0;
        this.lobbies = [];
    }

    ngOnInit(): void {
        this.clientSocket.connect(this.welcomeService.account.id as string, 'lobby');
        this.roomManagerService.handleRoomEvents();
        this.roomManagerService.retrieveLobbies();
        // this.roomManagerService.lobbies$.pipe(filter((lobbies) => !!lobbies)).subscribe((lobbies) => {
        //     this.lobbies = Array.from(lobbies.values());
        // });
        this.roomManagerService.lobbies$.subscribe((lobbies) => {
            if (lobbies.size) {
                console.log(lobbies);
                this.lobbies = Array.from(lobbies.values());
            }
        });
        // this.openDialog();
        // this.handleJoinCoopRoom();
        // this.handleNoGameAvailable();
    }

    manageGames(): void {
        this.dialog.open(ModalAccessMatchComponent);
    }

    ngOnDestroy(): void {
        // this.clientSocket.disconnect('lobby');
        this.roomIdSubscription?.unsubscribe();
        this.isLimitedCoopRoomAvailableSubscription?.unsubscribe();
        this.hasNoGameAvailableSubscription?.unsubscribe();
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
}

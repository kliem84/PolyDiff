/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RoomManagerService } from '@app/services/room-manager-service/room-manager.service';
import { Subscription, filter } from 'rxjs';

@Component({
    selector: 'app-room-sheet',
    templateUrl: './room-sheet.component.html',
    styleUrls: ['./room-sheet.component.scss'],
})
export class RoomSheetComponent implements OnInit, OnDestroy {
    numberOfDifferences: number;
    playerNames: string[] = [];
    private playerNamesSubscription?: Subscription;
    private data: { roomId: string; gameId: string; isLimited: boolean };

    constructor(public router: Router, private readonly roomManagerService: RoomManagerService) {
        this.playerNames = [];
        this.data = { roomId: '0', gameId: '', isLimited: true };
    }

    get isLimited(): boolean {
        return this.data.isLimited;
    }

    ngOnInit(): void {
        this.roomManagerService.getJoinedPlayerNames(this.data.gameId);
        this.loadPlayerNamesList();
    }

    ngOnDestroy(): void {
        this.playerNamesSubscription?.unsubscribe();
    }

    private loadPlayerNamesList(): void {
        this.playerNamesSubscription = this.roomManagerService.joinedPlayerNamesByGameId$
            .pipe(filter((playerNamesList) => !!playerNamesList))
            .subscribe((playerNamesList) => {
                this.playerNames = playerNamesList;
            });
    }
}

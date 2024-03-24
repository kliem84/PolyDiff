import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Lobby } from '@common/game-interfaces';

@Component({
    selector: 'app-waiting-game-dialog',
    templateUrl: './waiting-game-dialog.component.html',
    styleUrls: ['./waiting-game-dialog.component.scss'],
})
export class WaitingGameDialogComponent {
    countdown: number;
    refusedMessage: string;

    // Services are needed for the dialog and dialog needs to talk to the parent component
    // eslint-disable-next-line max-params
    constructor(@Inject(MAT_DIALOG_DATA) public data: { lobby: Lobby }) {}
}

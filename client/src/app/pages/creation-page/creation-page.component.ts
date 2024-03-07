import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreationGameDialogComponent } from '@app/components/creation-game-dialog/creation-game-dialog.component';
import { LEFT_BUTTON } from '@app/constants/constants';
import { DEFAULT_RADIUS, RADIUS_SIZES } from '@app/constants/difference';
import { CANVAS_MEASUREMENTS } from '@app/constants/image';
import { CanvasPosition } from '@app/enum/canvas-position';
import { CardManagerService } from '@app/services/card-manager-service/card-manager.service';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { ForegroundService } from '@app/services/foreground-service/foreground.service';
import { ImageService } from '@app/services/image-service/image.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';
import { CanvasMeasurements, GameDetails } from '@common/game-interfaces';

@Component({
    selector: 'app-root',
    templateUrl: './creation-page.component.html',
    styleUrls: ['./creation-page.component.scss'],
})
export class CreationPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('combinedCanvas') combinedCanvas: ElementRef;
    readonly canvasSizes: CanvasMeasurements;
    readonly configRoute: string;
    canvasPosition: typeof CanvasPosition;
    readonly radiusSizes: number[];
    radius: number;

    // Services are needed for the page and page needs to dialog component
    // eslint-disable-next-line max-params
    constructor(
        private readonly imageService: ImageService,
        private readonly foregroundService: ForegroundService,
        private readonly matDialog: MatDialog,
        private readonly router: Router,
        private readonly clientSocket: ClientSocketService,
        private readonly welcomeService: WelcomeService,
        private readonly cardManagerService: CardManagerService,
    ) {
        this.radiusSizes = RADIUS_SIZES;
        this.radius = DEFAULT_RADIUS;
        this.canvasPosition = CanvasPosition;
        this.canvasSizes = CANVAS_MEASUREMENTS;
        this.configRoute = '/admin';
    }

    @HostListener('window:keydown', ['$event'])
    keyboardEvent(event: KeyboardEvent) {
        if (event.ctrlKey && event.shiftKey && event.key === 'Z') {
            this.foregroundService.redoCanvasOperation();
        } else if (event.ctrlKey && event.key === 'z') {
            this.foregroundService.undoCanvasOperation();
        }
    }

    @HostListener('window:mouseup', ['$event'])
    mouseUpEvent(event: MouseEvent) {
        if (event.button === LEFT_BUTTON) {
            this.foregroundService.disableDragging();
        }
    }

    @HostListener('window:mousedown', ['$event'])
    mouseDownEvent(event: MouseEvent) {
        if (event.button === LEFT_BUTTON) {
            event.preventDefault();
            event.stopPropagation();
        }
    }

    ngAfterViewInit(): void {
        const combinedContext: CanvasRenderingContext2D = this.combinedCanvas.nativeElement.getContext('2d', { willReadFrequently: true });
        this.imageService.setCombinedContext(combinedContext);
        this.clientSocket.connect(this.welcomeService.account.credentials.username, 'game');
    }

    validateDifferences() {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.data = this.radius;
        this.matDialog
            .open(CreationGameDialogComponent, dialogConfig)
            .afterClosed()
            .subscribe((game: GameDetails) => {
                if (game) {
                    this.cardManagerService.createCard(game);
                    this.router.navigate(['/admin']);
                }
            });
    }

    ngOnDestroy(): void {
        this.clientSocket.disconnect('game');
    }
}

import { Injectable, OnDestroy } from '@angular/core';
import { REPLAY_LIMITER, SPEED_X1 } from '@app/constants/replay';
import { ReplayActions } from '@app/enum/replay-actions';
// import { ClickErrorData, ReplayEvent, ReplayPayload } from '@app/interfaces/replay-actions';
import { ReplayInterval } from '@app/interfaces/replay-interval';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { GameManagerService } from '@app/services/game-manager-service/game-manager.service';
import { ImageService } from '@app/services/image-service/image.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { WelcomeService } from '@app/services/welcome-service/welcome.service';
import { Coordinate, GameEventData, GameRecord } from '@common/game-interfaces';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ReplayService implements OnDestroy {
    isReplaying: boolean;
    record: GameRecord;
    private replayEvents: GameEventData[];
    private replaySpeed: number;
    private currentCoords: Coordinate[];
    private isCheatMode: boolean;
    private isDifferenceFound: boolean;
    private replayInterval: ReplayInterval;
    private currentReplayIndex: number;
    private replayTimer: BehaviorSubject<number>;
    private replayDifferenceFound: BehaviorSubject<number>;
    // private replayOpponentDifferenceFound: BehaviorSubject<number>;
    private replayEventsSubjectSubscription: Subscription;

    // Replay needs to communicate with all services
    // eslint-disable-next-line max-params
    constructor(
        private readonly gameAreaService: GameAreaService,
        private readonly gameManager: GameManagerService,
        private readonly soundService: SoundService,
        private readonly imageService: ImageService,
        private readonly welcome: WelcomeService,
    ) {
        this.isReplaying = false;
        this.replayTimer = new BehaviorSubject<number>(0);
        this.replayDifferenceFound = new BehaviorSubject<number>(0);
        // this.replayOpponentDifferenceFound = new BehaviorSubject<number>(0);
        this.replayEvents = [];
        this.replaySpeed = SPEED_X1;
        this.currentCoords = [];
        this.isCheatMode = false;
        this.isDifferenceFound = false;
        this.currentReplayIndex = 0;
    }

    get replayTimer$() {
        return this.replayTimer.asObservable();
    }

    get replayDifferenceFound$() {
        return this.replayDifferenceFound.asObservable();
    }

    // get replayOpponentDifferenceFound$() {
    //     return this.replayOpponentDifferenceFound.asObservable();
    // }

    setReplay(record: GameRecord): void {
        this.record = record;
    }

    startReplay(): void {
        this.replayEvents = this.record.gameEvents;
        this.isReplaying = true;
        this.currentReplayIndex = 0;
        this.replayInterval = this.createReplayInterval(
            () => this.replaySwitcher(this.replayEvents[this.currentReplayIndex]),
            () => this.getNextInterval(),
        );
        this.replayInterval.start();
    }

    restartReplay(): void {
        this.currentReplayIndex = 0;
        this.replayInterval.resume();
    }

    pauseReplay(): void {
        this.toggleFlashing(true);
        this.replayInterval.pause();
    }

    resumeReplay(): void {
        this.toggleFlashing(false);
        this.replayInterval.resume();
    }

    upSpeed(speed: number): void {
        this.replaySpeed = speed;
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
    }

    restartTimer(): void {
        // this.replayOpponentDifferenceFound.next(0);
        this.replayDifferenceFound.next(0);
        this.replayTimer.next(0);
    }

    resetReplay(): void {
        this.replaySpeed = SPEED_X1;
        this.replayEvents = [];
        this.currentReplayIndex = 0;
        this.isReplaying = false;
    }

    ngOnDestroy(): void {
        this.replayEventsSubjectSubscription?.unsubscribe();
    }

    private toggleFlashing(isPaused: boolean): void {
        if (this.isCheatMode) {
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
        if (this.isDifferenceFound) {
            this.gameAreaService.flashPixels(this.currentCoords, this.replaySpeed, isPaused);
        }
    }

    private replaySwitcher(replayData: GameEventData): void {
        console.log(replayData.gameEvent);
        console.log('index:', this.currentReplayIndex);
        switch (replayData.gameEvent) {
            case ReplayActions.StartGame:
                this.replayGameStart();
                break;
            case ReplayActions.Found:
                this.replayClickFound(replayData);
                break;
            case ReplayActions.NotFound:
                this.replayClickError(replayData);
                break;
            case ReplayActions.CaptureMessage:
                // this.replayCaptureMessage(replayData.data as ReplayPayload);
                break;
            case ReplayActions.CheatActivated:
                this.replayActivateCheat(replayData);
                break;
            case ReplayActions.CheatDeactivated:
                this.replayDeactivateCheat(replayData);
                break;
            case ReplayActions.UpdateTimer:
                this.replayTimerUpdate(replayData);
                break;
            // case ReplayActions.DifferenceFoundUpdate:
            //     // this.replayDifferenceFoundUpdate();
            //     break;
            // case ReplayActions.OpponentDifferencesFoundUpdate:
            //     // this.replayOpponentDifferencesFoundUpdate(replayData.data as ReplayPayload);
            //     break;
        }
        this.currentReplayIndex++;
    }

    private createReplayInterval(callback: () => void, getNextInterval: () => number): ReplayInterval {
        let timeoutId: ReturnType<typeof setTimeout> | null = null;
        let remainingTime: number;
        let startTime: number;

        const start = (delay: number = 0) => {
            if (this.currentReplayIndex < this.replayEvents.length) {
                startTime = Date.now();
                remainingTime = !delay ? getNextInterval() : delay;

                if (!delay) {
                    callback();
                }

                timeoutId = setTimeout(() => {
                    start();
                }, remainingTime);
            } else {
                this.cancelReplay();
            }
        };

        const pause = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                remainingTime -= Date.now() - startTime;
                timeoutId = null;
            }
        };

        const resume = () => {
            if (!timeoutId) {
                start(remainingTime);
            }
        };

        const cancel = () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            this.isReplaying = false;
        };

        return { start, pause, resume, cancel };
    }

    private cancelReplay(): void {
        this.replayInterval.cancel();
        this.currentReplayIndex = 0;
    }

    private getNextInterval(): number {
        const nextActionIndex = this.currentReplayIndex + 1;
        this.isDifferenceFound = false;
        let nextInterval = REPLAY_LIMITER;
        if (nextActionIndex < this.replayEvents.length) {
            const nextAction = this.replayEvents[nextActionIndex];
            const currentAction = this.replayEvents[this.currentReplayIndex];
            if (nextAction && currentAction) {
                nextInterval = ((nextAction.timestamp ?? 0) - (currentAction.timestamp ?? 0)) / this.replaySpeed;
            }
        }
        return nextInterval;
    }

    private replayGameStart(): void {
        this.gameManager.differences = this.record.game.differences as Coordinate[][];
        this.imageService.loadImage(this.gameAreaService.getOriginalContext(), this.record.game.original);
        this.imageService.loadImage(this.gameAreaService.getModifiedContext(), this.record.game.modified);
        this.gameAreaService.setAllData();
    }

    private replayClickFound(replayData: GameEventData): void {
        if (this.record.game.differences) {
            const currentIndex: number = this.record.game.differences.findIndex((difference) =>
                difference.some((coord: Coordinate) => coord.x === replayData.coordClic?.x && coord.y === replayData.coordClic?.y),
            );
            this.currentCoords = (this.record.game.differences as Coordinate[][])[currentIndex];
        }
        this.isDifferenceFound = true;
        this.soundService.playCorrectSoundDifference(this.welcome.account.profile.onCorrectSound);
        this.gameAreaService.setAllData();
        this.gameAreaService.replaceDifference(this.currentCoords, this.replaySpeed);
    }

    private replayClickError(replayData: GameEventData): void {
        this.soundService.playIncorrectSound(this.welcome.account.profile.onErrorSound);
        this.gameAreaService.showError(replayData.isMainCanvas as boolean, replayData.coordClic as Coordinate, this.replaySpeed);
    }

    // private replayCaptureMessage(replayData: ReplayPayload): void {
    //     this.gameManager.setMessage(replayData as Chat);
    // }

    private replayActivateCheat(replayData: GameEventData): void {
        this.isCheatMode = true;
        if (replayData.remainingDifferenceIndex) {
            this.currentCoords = (this.record.game.differences as Coordinate[][])[
                replayData.remainingDifferenceIndex[this.currentReplayIndex] as number
            ];
            this.gameAreaService.toggleCheatMode(this.currentCoords, this.replaySpeed);
        }
    }

    private replayDeactivateCheat(replayData: GameEventData): void {
        const startDifferences = (this.record.game.differences as Coordinate[][])[
            replayData.remainingDifferenceIndex?.[this.currentReplayIndex] as number
        ];
        this.isCheatMode = false;
        this.gameAreaService.toggleCheatMode(startDifferences, this.replaySpeed);
    }

    private replayTimerUpdate(replayData: GameEventData): void {
        this.replayTimer.next(replayData.timestamp as number);
    }

    // private replayDifferenceFoundUpdate(replayData: GameEventData): void {
    //     this.replayDifferenceFound.next();
    // }

    // private replayOpponentDifferencesFoundUpdate(replayData: ReplayPayload): void {
    //     this.replayOpponentDifferenceFound.next(replayData as number);
    // }
}

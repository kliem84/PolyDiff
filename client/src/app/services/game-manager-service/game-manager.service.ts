import { ChannelEvents, GameEvents, MessageEvents, MessageTag } from './../../../../../common/enums';
/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { ReplayEvent } from '@app/interfaces/replay-actions';
import { ClientSocketService } from '@app/services/client-socket-service/client-socket.service';
import { GameAreaService } from '@app/services/game-area-service/game-area.service';
import { SoundService } from '@app/services/sound-service/sound.service';
import { Coordinate } from '@common/coordinate';
import { Chat, ChatMessageGlobal, ClientSideGame, Game, GameConfigConst, Lobby, Players } from '@common/game-interfaces';
import { Subject, filter } from 'rxjs';
@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    replayEventsSubject: Subject<ReplayEvent>;
    differences: Coordinate[][];
    gameConstants: GameConfigConst;
    username: string;
    isLeftCanvas: boolean;
    game: Subject<Game>;
    timerLobby: Subject<number>;
    lobbyWaiting: Lobby;
    endGame: string;
    private timer: Subject<number>;
    private differencesFound: Subject<number>;
    private opponentDifferencesFound: Subject<number>;
    private currentGame: Subject<ClientSideGame>;
    private message: Subject<Chat>;

    private endMessage: Subject<string>;
    private players: Subject<Players>;
    private isFirstDifferencesFound: Subject<boolean>;
    private isGameModeChanged: Subject<boolean>;
    private isGamePageRefreshed: Subject<boolean>;
    private globalMessage: Subject<ChatMessageGlobal>;

    // Service are needed to be used in this service
    // eslint-disable-next-line max-params
    constructor(
        private readonly clientSocket: ClientSocketService,
        gameAreaService: GameAreaService,
        soundService: SoundService,
        // private readonly captureService: CaptureService,
    ) {
        this.currentGame = new Subject<ClientSideGame>();
        this.differencesFound = new Subject<number>();
        this.timer = new Subject<number>();
        this.players = new Subject<Players>();
        this.game = new Subject<Game>();
        this.timerLobby = new Subject<number>();
        this.message = new Subject<Chat>();
        this.endMessage = new Subject<string>();
        this.opponentDifferencesFound = new Subject<number>();
        this.replayEventsSubject = new Subject<ReplayEvent>();
        this.isFirstDifferencesFound = new Subject<boolean>();
        this.isGameModeChanged = new Subject<boolean>();
        this.isGamePageRefreshed = new Subject<boolean>();
        this.globalMessage = new Subject<ChatMessageGlobal>();
    }

    get currentGame$() {
        return this.currentGame.asObservable().pipe(filter((game) => !!game));
    }

    get timer$() {
        return this.timer.asObservable().pipe(filter((timer) => !!timer));
    }
    get differencesFound$() {
        return this.differencesFound.asObservable().pipe(filter((differencesFound) => !!differencesFound));
    }
    get message$() {
        return this.message.asObservable();
    }

    get game$() {
        return this.game.asObservable();
    }

    get timerLobby$() {
        return this.timerLobby.asObservable();
    }
    get endMessage$() {
        return this.endMessage.asObservable().pipe(filter((message) => !!message));
    }

    get opponentDifferencesFound$() {
        return this.opponentDifferencesFound.asObservable().pipe(filter((differencesFound) => !!differencesFound));
    }

    get players$() {
        return this.players.asObservable().pipe(filter((players) => !!players));
    }

    get isFirstDifferencesFound$() {
        return this.isFirstDifferencesFound.asObservable();
    }

    get isGameModeChanged$() {
        return this.isGameModeChanged.asObservable();
    }

    get isGamePageRefreshed$() {
        return this.isGamePageRefreshed.asObservable();
    }

    get globalMessage$() {
        return this.globalMessage.asObservable();
    }

    setMessage(message: Chat) {
        this.message.next(message);
    }

    getSocketId(nameSpace: string): string {
        switch (nameSpace) {
            case 'lobby':
                return this.clientSocket.lobbySocket.id;
            case 'game':
                return this.clientSocket.gameSocket.id;
            case 'auth':
                return this.clientSocket.authSocket.id;
            default:
                throw new Error(`Unknown namespace: ${nameSpace}`);
        }
    }

    startGame(): void {
        this.clientSocket.send('game', GameEvents.StartGameByRoomId);
    }

    startNextGame(): void {
        this.clientSocket.send('game', GameEvents.StartNextGame);
    }

    requestVerification(coords: Coordinate): void {
        this.clientSocket.send('game', GameEvents.RemoveDifference, coords);
    }

    abandonGame(): void {
        this.clientSocket.send('game', GameEvents.AbandonGame);
    }

    requestHint(): void {
        this.clientSocket.send('game', GameEvents.RequestHint);
    }

    setIsLeftCanvas(isLeft: boolean): void {
        this.isLeftCanvas = isLeft;
    }

    // sendMessage(textMessage: string): void {
    //     const newMessage = { tag: MessageTag.Received, message: textMessage };
    //     this.captureService.saveReplayEvent(ReplayActions.CaptureMessage, { tag: MessageTag.Sent, message: textMessage } as ChatMessage);
    //     this.clientSocket.send('game', MessageEvents.LocalMessage, newMessage);
    // }

    sendMessage(lobbyId: string | undefined, message: string): void {
        this.clientSocket.send('game', ChannelEvents.SendGameMessage, { lobbyId, message });
        console.log('prend mon message' + message + lobbyId);
    }
    removeAllListeners(nameSpace: string) {
        switch (nameSpace) {
            case 'lobby':
                this.clientSocket.lobbySocket.off();
                break;
            case 'game':
                this.clientSocket.gameSocket.off();
                break;
            case 'auth':
                this.clientSocket.authSocket.off();
                break;
            default:
                throw new Error(`Unknown namespace: ${nameSpace}`);
        }
    }

    sendGlobalMessage(textMessage: string): void {
        const newMessage = { tag: MessageTag.Received, message: textMessage, userName: this.username };
        this.clientSocket.send('game', MessageEvents.GlobalMessage, newMessage);
    }

    manageSocket(): void {
        this.game = new Subject<Game>();
        this.message = new Subject<Chat>();
        this.timerLobby = new Subject<number>();
        this.clientSocket.on('game', GameEvents.StartGame, (game: Game) => {
            console.log('yoooo' + game.lobbyId);
            this.game.next(game);
        });

        this.clientSocket.on('game', ChannelEvents.GameMessage, (chat: Chat) => {
            console.log('yoooo' + chat.raw);
            this.message.next(chat);
        });

        this.clientSocket.on('game', GameEvents.TimerUpdate, (time: number) => {
            this.timerLobby.next(time);
        });

        // this.clientSocket.on('game', GameEvents.GameStarted, (room: GameRoom) => {
        //     this.currentGame.next(room.clientGame);
        //     this.gameConstants = room.gameConstants;
        //     this.players.next({ player1: room.player1, player2: room.player2 });
        //     this.differences = room.originalDifferences;
        //     this.captureService.saveReplayEvent(ReplayActions.StartGame, room);
        // });

        // this.clientSocket.on(
        //     'game',
        //     GameEvents.RemoveDifference,
        //     (data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[][] }) => {
        //         this.handleRemoveDifference(data);
        //     },
        // );

        // this.clientSocket.on('game', GameEvents.TimerUpdate, (timer: number) => {
        //     this.timer.next(timer);
        //     this.captureService.saveReplayEvent(ReplayActions.TimerUpdate, timer);
        // });

        // this.clientSocket.on('game', GameEvents.EndGame, (endGameMessage: string) => {
        //     this.endMessage.next(endGameMessage);
        // });

        // this.clientSocket.on('game', MessageEvents.GlobalMessage, (receivedMessage: ChatMessageGlobal) => {
        //     if (receivedMessage.userName === this.username) {
        //         receivedMessage.tag = MessageTag.Sent;
        //     } else {
        //         receivedMessage.tag = MessageTag.Received;
        //     }
        //     this.globalMessage.next(receivedMessage);
        //     // this.captureService.saveReplayEvent(ReplayActions.CaptureMessage, receivedMessage);
        // });

        // this.clientSocket.on('game', GameEvents.UpdateDifferencesFound, (differencesFound: number) => {
        //     this.differencesFound.next(differencesFound);
        // });

        // this.clientSocket.on('game', GameEvents.GameModeChanged, () => {
        //     this.isGameModeChanged.next(true);
        // });

        // this.clientSocket.on('game', GameEvents.GamePageRefreshed, () => {
        //     this.isGamePageRefreshed.next(true);
        // });
    }

    off(): void {
        // this.clientSocket.lobbySocket.off(ChannelEvents.LobbyMessage);
        // this.clientSocket.lobbySocket.off(LobbyEvents.UpdateLobbys);
        if (this.game && !this.game.closed) {
            this.game?.unsubscribe();
        }
        if (this.message && !this.message.closed) this.message?.unsubscribe();
        if (this.timerLobby && !this.timerLobby.closed) this.timerLobby?.unsubscribe();
    }

    // private checkStatus(): void {
    //     this.clientSocket.send('game', GameEvents.CheckStatus);
    // }

    // private replaceDifference(differences: Coordinate[], isPlayerIdMatch: boolean): void {
    //     const hasDifferences = differences.length > 0;
    //     if (!hasDifferences) {
    //         this.soundService.playErrorSound();
    //         this.gameAreaService.showError(this.isLeftCanvas, this.gameAreaService.mousePosition);
    //         return;
    //     }
    //     this.soundService.playCorrectSound();
    //     this.gameAreaService.setAllData();
    //     this.gameAreaService.replaceDifference(differences);
    //     if (isPlayerIdMatch) this.isFirstDifferencesFound.next(true);
    // }

    // private handleRemoveDifference(data: { differencesData: Differences; playerId: string; cheatDifferences: Coordinate[][] }): void {
    //     const isPlayerIdMatch = data.playerId === this.getSocketId('game');
    //     if (isPlayerIdMatch) {
    //         this.replaceDifference(data.differencesData.currentDifference, isPlayerIdMatch);
    //         this.differencesFound.next(data.differencesData.differencesFound);
    //         this.checkStatus();
    //         this.captureService.saveReplayEvent(ReplayActions.DifferenceFoundUpdate, data.differencesData.differencesFound);
    //     } else if (data.differencesData.currentDifference.length !== 0) {
    //         this.replaceDifference(data.differencesData.currentDifference, isPlayerIdMatch);
    //         this.opponentDifferencesFound.next(data.differencesData.differencesFound);
    //         this.captureService.saveReplayEvent(ReplayActions.OpponentDifferencesFoundUpdate, data.differencesData.differencesFound);
    //     }
    //     this.differences = data.cheatDifferences;
    // }
}

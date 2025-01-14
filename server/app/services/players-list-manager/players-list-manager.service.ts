import { GameService } from '@app/services/game/game.service';
import { MessageManagerService } from '@app/services/message-manager/message-manager.service';
import { MAX_TIMES_INDEX, NOT_FOUND } from '@common/constants';
import { GameCardEvents, MessageEvents, PlayerEvents, RoomEvents } from '@common/enums';
import { Differences, GameRoom, NewRecord, Player, PlayerData, PlayerNameAvailability, PlayerTime } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as io from 'socket.io';

@Injectable()
export class PlayersListManagerService {
    private joinedPlayersByGameId: Map<string, Player[]>;

    constructor(private readonly gameService: GameService, private readonly messageManagerService: MessageManagerService) {
        this.joinedPlayersByGameId = new Map<string, Player[]>();
    }

    updateWaitingPlayerNameList(playerPayLoad: PlayerData, socket: io.Socket): void {
        const playerNames = this.joinedPlayersByGameId.get(playerPayLoad.gameId) ?? [];
        const differenceData = { currentDifference: [], differencesFound: 0 } as Differences;
        const playerGuest = { name: playerPayLoad.playerName, differenceData, socketId: socket.id } as Player;
        playerNames.push(playerGuest);
        this.joinedPlayersByGameId.set(playerPayLoad.gameId, playerNames);
    }

    getWaitingPlayerNameList(hostId: string, gameId: string, server: io.Server): void {
        const playerNamesList = Array.from(this.joinedPlayersByGameId.get(gameId) ?? []).map((player) => player.name);
        server.to(hostId).emit(PlayerEvents.WaitingPlayerNameListUpdated, playerNamesList);
    }

    refusePlayer(playerPayLoad: PlayerData, server: io.Server): void {
        this.cancelJoiningByPlayerName(playerPayLoad.playerName, playerPayLoad.gameId, server);
    }

    getAcceptPlayer(gameId: string, server: io.Server): Player {
        const acceptedPlayer = this.joinedPlayersByGameId.get(gameId)?.[0];
        if (!acceptedPlayer) return;
        this.cancelAllJoining(gameId, server);
        return acceptedPlayer;
    }

    checkIfPlayerNameIsAvailable(playerPayLoad: PlayerData, server: io.Server): void {
        const joinedPlayerNames = this.joinedPlayersByGameId.get(playerPayLoad.gameId);
        const playerNameAvailability = { gameId: playerPayLoad.gameId, isNameAvailable: true } as PlayerNameAvailability;
        playerNameAvailability.isNameAvailable = !joinedPlayerNames?.some((player) => player.name === playerPayLoad.playerName);
        server.emit(PlayerEvents.PlayerNameTaken, playerNameAvailability);
    }

    cancelJoiningByPlayerId(socketId: string, gameId: string): void {
        const playerNames = this.joinedPlayersByGameId.get(gameId);
        if (!playerNames) return;
        const index = playerNames.indexOf(playerNames.find((player) => player.accountId === socketId));
        if (index !== NOT_FOUND) playerNames.splice(index, 1);
        this.joinedPlayersByGameId.set(gameId, playerNames);
    }

    cancelAllJoining(gameId: string, server: io.Server): void {
        structuredClone(this.joinedPlayersByGameId.get(gameId))?.forEach((player: Player) => {
            this.cancelJoiningByPlayerName(player.name, gameId, server);
        });
    }

    getGameIdByPlayerId(socketId: string): string {
        return Array.from(this.joinedPlayersByGameId.keys()).find((gameId) =>
            this.joinedPlayersByGameId.get(gameId).some((player) => player.accountId === socketId),
        );
    }

    deleteJoinedPlayerByPlayerId(socketId: string, gameId: string) {
        const playerNames = this.joinedPlayersByGameId.get(gameId);
        if (!playerNames) return;
        const playerIndex = playerNames.findIndex((player) => player.accountId === socketId);
        if (playerIndex !== NOT_FOUND) playerNames.splice(playerIndex, 1);
        this.joinedPlayersByGameId.set(gameId, playerNames);
    }

    async resetAllTopTime(server: io.Server): Promise<void> {
        await this.gameService.resetAllTopTimes();
        server.emit(GameCardEvents.RequestReload);
    }

    deleteJoinedPlayersByGameId(gameId: string): void {
        this.joinedPlayersByGameId.delete(gameId);
    }

    async resetTopTime(gameId: string, server: io.Server): Promise<void> {
        await this.gameService.resetTopTimesGameById(gameId);
        server.emit(GameCardEvents.RequestReload);
    }

    async updateTopBestTime(room: GameRoom, playerName: string, server: io.Server): Promise<number> {
        const { clientGame, timer } = room;
        if (!(await this.gameService.verifyIfGameExists(clientGame.name))) return;
        const topTimes = await this.gameService.getTopTimesGameById(clientGame.id, clientGame.mode);
        if (topTimes[MAX_TIMES_INDEX].time > timer) {
            const topTimeIndex = this.insertNewTopTime(playerName, timer, topTimes);
            await this.gameService.updateTopTimesGameById(clientGame.id, clientGame.mode, topTimes);
            server.emit(GameCardEvents.RequestReload);
            const newRecord = { playerName, rank: topTimeIndex, gameName: clientGame.name, gameMode: clientGame.mode } as NewRecord;
            this.sendNewTopTimeMessage(newRecord, server);
            return topTimeIndex;
        }
    }

    private cancelJoiningByPlayerName(playerName: string, gameId: string, server: io.Server): void {
        const socketId = this.getPlayerIdByPlayerName(gameId, playerName);
        if (!socketId) return;
        this.cancelJoiningByPlayerId(socketId, gameId);
        server.to(socketId).emit(PlayerEvents.PlayerRefused, socketId);
        server.emit(RoomEvents.UndoRoomCreation, gameId);
    }

    private getPlayerIdByPlayerName(gameId: string, playerName: string): string {
        return this.joinedPlayersByGameId.get(gameId)?.find((player) => player.name === playerName)?.accountId;
    }

    private insertNewTopTime(playerName: string, timer: number, topTimes: PlayerTime[]): number {
        const newTopTime = { name: playerName, time: timer } as PlayerTime;
        topTimes.splice(MAX_TIMES_INDEX, 1, newTopTime);
        topTimes.sort((a, b) => a.time - b.time);
        return topTimes.findIndex((topTime) => topTime.name === playerName) + 1;
    }

    private sendNewTopTimeMessage(newRecord: NewRecord, server: io.Server): void {
        const newRecordMessage = this.messageManagerService.getNewRecordMessage(newRecord);
        server.emit(MessageEvents.LocalMessage, newRecordMessage);
    }
}

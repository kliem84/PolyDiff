import { Game, GameDocument } from '@app/model/database/game';
import { GameCardDocument } from '@app/model/database/game-card';
import { GameConstants, GameConstantsDocument } from '@app/model/database/game-config-constants';
import { GameHistory, GameHistoryDocument } from '@app/model/database/game-history';
import { CreateGameDto } from '@app/model/dto/game/create-game.dto';
import { GameConstantsDto } from '@app/model/dto/game/game-constants.dto';
import { GameListsManagerService } from '@app/services/game-lists-manager/game-lists-manager.service';
import { CarouselPaginator, PlayerTime } from '@common/game-interfaces';
import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
export declare class DatabaseService implements OnModuleInit {
    private readonly gameModel;
    private readonly gameCardModel;
    private readonly gameConstantsModel;
    private readonly gameHistoryModel;
    private readonly gameListManager;
    private defaultConstants;
    private gameIds;
    constructor(gameModel: Model<GameDocument>, gameCardModel: Model<GameCardDocument>, gameConstantsModel: Model<GameConstantsDocument>, gameHistoryModel: Model<GameHistoryDocument>, gameListManager: GameListsManagerService);
    onModuleInit(): Promise<void>;
    getGamesCarrousel(): Promise<CarouselPaginator[]>;
    getTopTimesGameById(gameId: string, gameMode: string): Promise<PlayerTime[]>;
    getGameById(id: string): Promise<Game>;
    getGameConstants(): Promise<GameConstants>;
    verifyIfGameExists(gameName: string): Promise<boolean>;
    saveFiles(newGame: CreateGameDto): void;
    addGameInDb(newGame: CreateGameDto): Promise<void>;
    deleteGameAssetsByName(gameName: string): void;
    deleteGameById(id: string): Promise<void>;
    deleteAllGames(): Promise<never>;
    updateTopTimesGameById(id: string, gameMode: string, topTimes: PlayerTime[]): Promise<void>;
    updateGameConstants(gameConstantsDto: GameConstantsDto): Promise<void>;
    resetTopTimesGameById(gameId: string): Promise<never>;
    resetAllTopTimes(): Promise<never>;
    getRandomGame(playedGameIds: string[]): Promise<Game>;
    getGamesHistory(): Promise<GameHistory[]>;
    saveGameHistory(gameHistory: GameHistory): Promise<void>;
    deleteAllGamesHistory(): Promise<never>;
    private populateDbWithGameConstants;
    private getAllGameIds;
    private rebuildGameCarousel;
}
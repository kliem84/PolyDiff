import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AccountController } from './controllers/account/account.controller';
import { GameController } from './controllers/game/game.controller';
import { AuthGateway } from './gateways/auth/auth.gateway';
import { GameGateway } from './gateways/game/game.gateway';
import { LobbyGateway } from './gateways/lobby/lobby.gateway';
import { Account, accountSchema } from './model/database/account';
import { Game, gameSchema } from './model/database/game';
import { GameCard, gameCardSchema } from './model/database/game-card';
import { GameConstants, gameConstantsSchema } from './model/database/game-config-constants';
import { GameHistory, gameHistorySchema } from './model/database/game-history';
import { AccountManagerService } from './services/account-manager/account-manager.service';
import { CardManagerService } from './services/card-manager/card-manager.service';
import { ClassicModeService } from './services/classic-mode/classic-mode.service';
import { GameListsManagerService } from './services/game-lists-manager/game-lists-manager.service';
import { HistoryService } from './services/history/history.service';
import { ImageManagerService } from './services/image-manager/image-manager.service';
import { LimitedModeService } from './services/limited-mode/limited-mode.service';
import { MessageManagerService } from './services/message-manager/message-manager.service';
import { PlayersListManagerService } from './services/players-list-manager/players-list-manager.service';
import { RoomsManagerService } from './services/rooms-manager/rooms-manager.service';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'assets'),
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => ({
                uri: config.get<string>('DATABASE_CONNECTION_STRING'), // Loaded from .env
            }),
        }),
        MongooseModule.forFeature([
            { name: Account.name, schema: accountSchema },
            { name: Game.name, schema: gameSchema },
            { name: GameCard.name, schema: gameCardSchema },
            { name: GameConstants.name, schema: gameConstantsSchema },
            { name: GameHistory.name, schema: gameHistorySchema },
        ]),
    ],
    controllers: [GameController, AccountController],
    providers: [
        Logger,
        CardManagerService,
        ConfigService,
        AuthGateway,
        GameGateway,
        LobbyGateway,
        ClassicModeService,
        GameListsManagerService,
        MessageManagerService,
        HistoryService,
        PlayersListManagerService,
        RoomsManagerService,
        LimitedModeService,
        AccountManagerService,
        ImageManagerService,
    ],
})
export class AppModule {}

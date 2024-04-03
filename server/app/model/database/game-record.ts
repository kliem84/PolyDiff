/* eslint-disable no-undef */
// eslint-disable-next-line max-classes-per-file
import { Coordinate, Game, GameEventData, Player } from '@common/game-interfaces';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type GameRecordDocument = GameRecord & Document;

@Schema()
export class GameRecord {
    // account ids of players who saved the recorded game
    @ApiProperty()
    @Prop({ required: true })
    accountIds: string[];

    @ApiProperty()
    @Prop({
        required: true,
        type: () => ({
            lobbyId: String,
            gameId: String,
            name: String,
            original: String,
            modified: String,
            difficulty: String,
            differences: Array<Coordinate[]>,
            nDifferences: Number,
        }),
    })
    game: Game;

    @ApiProperty()
    @Prop({ required: true })
    players: Player[];

    @ApiProperty()
    @Prop({ required: true })
    date: Date;

    @ApiProperty({ required: false })
    @Prop()
    startTime: number;

    @ApiProperty()
    @Prop({ required: false })
    endTime: number;

    @ApiProperty()
    @Prop({ required: false })
    duration: number;

    @ApiProperty({ required: true })
    @Prop({ required: true })
    isCheatEnabled: boolean;

    @ApiProperty()
    @Prop({ required: true })
    timeLimit: number;

    @ApiProperty()
    @Prop({ required: true })
    gameEvents: GameEventData[];
}

export const gameRecordSchema = SchemaFactory.createForClass(GameRecord);
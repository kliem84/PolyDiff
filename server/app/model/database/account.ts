// eslint-disable-next-line max-classes-per-file
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

@Schema()
export class SessionLog {
    @Prop({ required: true })
    timestamp: string;

    @Prop({ required: true })
    isWinner: boolean;
}

export const sessionLogSchema = SchemaFactory.createForClass(SessionLog);

@Schema()
export class ConnexionLog {
    @Prop({ required: true })
    timestamp: string;

    @Prop({ required: true })
    isConnexion: boolean;
}

export const connexionLogSchema = SchemaFactory.createForClass(ConnexionLog);

export class Statistics {
    @Prop({ required: true })
    gamePlayed: number;

    @Prop({ required: true })
    gameWon: number;

    @Prop({ required: true })
    averageTime: number;

    @Prop({ required: true })
    averageDifferences: number;
}

export const statisticsSchema = SchemaFactory.createForClass(Statistics);

@Schema()
export class Friend {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    avatar: string;

    @Prop({ type: [String] })
    friendNames: string[];

    @Prop({ type: [String] })
    commonFriendNames: string[];

    @Prop({ required: true })
    isFavorite: boolean;

    @Prop({ required: true })
    isOnline: boolean;
}

export const friendSchema = SchemaFactory.createForClass(Friend);

@Schema()
export class Profile {
    @Prop({ required: true })
    pseudo: string;

    @Prop({ required: true })
    avatar: string;

    @Prop({ type: [sessionLogSchema], default: [] })
    sessions: Types.Array<SessionLog>;

    @Prop({ type: [connexionLogSchema], default: [] })
    connexions: Types.Array<ConnexionLog>;

    @Prop({ type: statisticsSchema, required: true })
    stats: Statistics;

    @Prop({ type: [friendSchema], default: [] })
    friends: Types.Array<Friend>;

    @Prop({ type: [String], default: [] })
    friendRequests: string[];
}

export const profileSchema = SchemaFactory.createForClass(Profile);

@Schema()
export class Credentials {
    @Prop({ required: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    email: string;
}

export const credentialsSchema = SchemaFactory.createForClass(Credentials);

@Schema()
export class AccountSchema {
    @ApiProperty()
    @Prop({ required: true })
    accountId: string;

    @ApiProperty()
    @Prop({ required: true, type: credentialsSchema })
    credentials: Types.Subdocument;

    @ApiProperty()
    @Prop({ required: true, type: profileSchema })
    profile: Types.Subdocument;
}

export type AccountDocument = AccountSchema & Document;
export const accountSchema = SchemaFactory.createForClass(AccountSchema);

// Id comes from database to allow _id
/* eslint-disable no-underscore-dangle */
import { Game } from '@app/model/database/game';
import { DEFAULT_BEST_TIMES, GAME_CARROUSEL_SIZE } from '@common/constants';
import { CarouselPaginator, GameCard } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';

@Injectable()
export class GameListsManagerService {
    private carouselGames: CarouselPaginator[];

    constructor() {
        this.carouselGames = [];
    }

    buildGameCardFromGame(game: Game): GameCard {
        const gameCard: GameCard = {
            _id: game._id,
            name: game.name,
            difficultyLevel: game.isHard,
            soloTopTime: DEFAULT_BEST_TIMES,
            oneVsOneTopTime: DEFAULT_BEST_TIMES,
            thumbnail: `assets/${game._id.toString()}/original.bmp`,
            nDifference: game.nDifference,
        };
        return gameCard;
    }

    addGameCarousel(gameCard: GameCard): void {
        let lastIndex: number = this.carouselGames.length - 1;
        gameCard.thumbnail = fs.readFileSync(gameCard.thumbnail, 'base64');
        if (this.carouselGames[lastIndex].gameCards.length < GAME_CARROUSEL_SIZE) {
            this.carouselGames[lastIndex].gameCards.push(gameCard);
        } else {
            this.carouselGames.push({
                hasNext: false,
                hasPrevious: true,
                gameCards: [],
            });
            this.carouselGames[lastIndex].hasNext = true;
            this.carouselGames[++lastIndex].gameCards.push(gameCard);
        }
    }
    buildGameCarousel(gameCards: GameCard[]): void {
        this.carouselGames = [];
        this.carouselGames.push({
            hasNext: false,
            hasPrevious: false,
            gameCards: [],
        });
        for (const gameCard of gameCards) {
            this.addGameCarousel(gameCard);
        }
    }

    getCarouselGames(): CarouselPaginator[] {
        return this.carouselGames;
    }
}

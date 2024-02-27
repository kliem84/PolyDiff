import { ConnectionLog, PlayerTime, Theme } from "./game-interfaces";

export const DEFAULT_HINT_PENALTY = 5;
export const DEFAULT_BONUS_TIME = 5;
export const MAX_BONUS_TIME_ALLOWED = 120;

export const GAME_CARROUSEL_SIZE = 4;

export const DEFAULT_BEST_TIMES: PlayerTime[] = [
    { name: 'John Doe', time: 100 },
    { name: 'Jane Doe', time: 200 },
    { name: 'the scream', time: 250 },
];

export const ELEMENT_DATA: ConnectionLog[] = [
    {
        timestamp: 'connexion',
        isConnexion: true,
    },
];

export const THEME_PERSONNALIZATION: Theme[] = [
    { name: 'Default', color: '', buttonColor: 'black', backgroundColor: 'white' },
    { name: 'oragina', color: '', buttonColor: 'Orange', backgroundColor: 'YellowOrange' },
    { name: 'cafe', color: '', buttonColor: 'brown', backgroundColor: 'black' },
];

export const LANGUAGES: string[] = ['fr', 'en'];

export const KEY_SIZE = 36;
export const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const MAX_TIMES_INDEX = 2;
export const PADDING_N_DIGITS = 2;
export const NOT_FOUND = -1;

export const SCORE_POSITION = { one: 'première', two: 'deuxième', three: 'troisième' };

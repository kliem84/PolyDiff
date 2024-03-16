import { GameModes } from './enums';
import { ConnectionLog, PlayerTime, Sound, Theme } from './game-interfaces';

export const DEFAULT_COUNTDOWN_VALUE = 30;
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
        isConnection: true,
    },
];

export const THEME_PERSONALIZATION: Theme[] = [
    { name: 'Default', color: '', buttonColor: 'black', backgroundColor: 'white' },
    { name: 'oragina', color: '', buttonColor: 'Orange', backgroundColor: 'YellowOrange' },
    { name: 'cafe', color: '', buttonColor: 'brown', backgroundColor: 'black' },
];

export const SOUND_LIST_DIFFERENCE: Sound[] = [
    { id: '1', path: 'assets/sound/WinSoundEffect.mp3' },
    { id: 'Sound2', path: 'assets/sound/WinSoundEffect.mp3' },
    { id: 'Sound3', path: 'assets/sound/WinSoundEffect.mp3' },
];

export const SOUND_LIST_ERROR: Sound[] = [
    { id: 'DefaultSound', path: 'assets/sound/ErrorSoundEffect.mp3' },
    { id: 'Sound2', path: 'assets/sound/ErrorSoundEffect.mp3' },
    { id: 'Sound3', path: 'assets/sound/ErrorSoundEffect.mp3' },
];

export const LANGUAGES: string[] = ['fr', 'en'];

export const KEY_SIZE = 36;
export const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const MAX_TIMES_INDEX = 2;
export const PADDING_N_DIGITS = 2;
export const NOT_FOUND = -1;

export const SCORE_POSITION = { one: 'première', two: 'deuxième', three: 'troisième' };

export const DEFAULT_GAME_MODES = {
    [GameModes.ClassicSolo]: { isCountdown: false },
    [GameModes.ClassicOneVsOne]: { isCountdown: false, requiresPlayer2: true },
    [GameModes.LimitedSolo]: { isCountdown: true },
    [GameModes.LimitedCoop]: { isCountdown: true, requiresPlayer2: true },
};

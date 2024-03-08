/* eslint-disable no-underscore-dangle */
import { Theme } from './../../model/database/account';
/* eslint-disable @typescript-eslint/naming-convention */
import { Account, AccountDocument, Credentials, Statistics } from '@app/model/database/account';
import { ImageManagerService } from '@app/services/image-manager/image-manager.service';
import { THEME_PERSONNALIZATION } from '@common/constants';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AccountManagerService implements OnModuleInit {
    users: Map<string, Account> = new Map<string, Account>(); // Key is the id :: ALWAYS USE THIS TO GET - USERS
    connectedUsers: Map<string, Account> = new Map<string, Account>(); // Key is the id :: ALWAYS USE THIS TO GET - CONNECTED USERS

    constructor(
        private readonly logger: Logger,
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
        private readonly imageManager: ImageManagerService,
    ) {}

    onModuleInit() {
        this.fetchUsers();
    }

    async register(creds: Credentials, id: string) {
        try {
            const userFound = await this.accountModel.findOne({ 'credentials.username': creds.username });
            const emailFound = await this.accountModel.findOne({ 'credentials.email': creds.email });
            if (userFound) throw new Error('Username already taken');
            if (emailFound) throw new Error('Email already taken');

            const newAccount: Account = {
                credentials: creds,
                profile: {
                    avatar: this.imageManager.convert(`default${id}.png`),
                    sessions: [],
                    connections: [],
                    stats: {} as Statistics,
                    friends: [],
                    friendRequests: [],
                    language: 'en',
                    theme: THEME_PERSONNALIZATION[0],
                },
            };
            await this.accountModel.create(newAccount);
            this.logger.verbose(`Account ${creds.username} has registered successfully`);
            this.fetchUsers();
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to add account --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async connexion(creds: Credentials): Promise<Account> {
        try {
            const accountFound = await this.accountModel.findOne({
                $or: [
                    { 'credentials.username': creds.username, 'credentials.password': creds.password },
                    { 'credentials.email': creds.username, 'credentials.password': creds.password },
                ],
            });
            if (!accountFound) throw new Error('Account not found');
            if (this.connectedUsers.has(accountFound.credentials.username)) throw new Error('Account already connected');

            accountFound.profile.avatar = '';
            accountFound.id = accountFound._id.toString();

            this.imageManager.save(accountFound.id, accountFound.profile.avatar);
            this.connectedUsers.set(accountFound.id, accountFound);

            this.fetchUsers();
            return Promise.resolve(accountFound);
        } catch (error) {
            this.logger.error(`Failed to connect account --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async changePseudo(oldUsername: string, newUsername: string): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': oldUsername });
            const pseudoFound = await this.accountModel.findOne({ 'credentials.username': newUsername });
            if (!accountFound) throw new Error('Account not found');
            if (pseudoFound) throw new Error('Username already taken');

            accountFound.credentials.username = newUsername;
            await accountFound.save();
            await this.fetchUsers();

            this.logger.verbose(`Account ${oldUsername} has changed his username to ${newUsername}`);
            this.fetchUsers();
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to change pseudo --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async changePassword(username: string, newPasword: string): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': username });
            if (!accountFound) throw new Error('Account not found');

            accountFound.credentials.password = newPasword;

            await accountFound.save();
            this.logger.verbose(`${username} has changed his password`);
            this.fetchUsers();
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to change pseudo --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async modifyTheme(oldUsername: string, newTheme: Theme): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': oldUsername });

            if (!accountFound) throw new Error('Account not found');

            accountFound.profile.theme = newTheme;

            await accountFound.save();
            this.logger.verbose('Theme change');
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to change theme --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async modifyLanguage(oldUsername: string, newLanguage: string): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': oldUsername });

            if (!accountFound) throw new Error('Account not found');

            accountFound.profile.language = newLanguage;

            await accountFound.save();
            this.logger.verbose('language change');
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to change language --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async uploadAvatar(username: string, avatar: string): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': username });
            if (!accountFound) throw new Error('Account not found');
            this.imageManager.save(accountFound.id ? accountFound.id : accountFound._id, avatar);
            accountFound.profile.avatar = avatar;

            await accountFound.save();
            this.logger.log(`${username} has changed his avatar`);
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to upload avatar --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async chooseAvatar(username: string, id: string): Promise<void> {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': username });
            if (!accountFound) throw new Error('Account not found');

            const base64 = this.imageManager.convert(`default${id}.png`);
            this.imageManager.save(username, base64);

            accountFound.profile.avatar = base64;
            await accountFound.save();
            this.logger.log(`${username} has changed his avatar`);
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to choose avatar --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async deleteAccount(creds: Credentials) {
        try {
            const accountFound = await this.accountModel.findOne({ 'credentials.username': creds.username });
            if (!accountFound) throw new Error('Account not found');
            await this.accountModel.deleteOne({ 'credentials.username': creds.username });
            this.logger.verbose(`Account ${creds.username} has been deleted`);
            this.fetchUsers();
            return Promise.resolve();
        } catch (error) {
            this.logger.error(`Failed to delete account --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async deleteAccounts() {
        try {
            await this.accountModel.deleteMany({});
            this.logger.verbose('All accounts have been deleted');
        } catch (error) {
            this.logger.error(`Failed to delete accounts --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    async fetchUsers() {
        await this.accountModel.find().then((accounts) => {
            accounts.forEach((account) => {
                this.users.set(account.credentials.username, account);
            });
        });
    }

    async connexionToAdmin(password: string): Promise<boolean> {
        try {
            if (password !== 'admin') throw new Error('Wrong password');
            return Promise.resolve(password === 'admin');
        } catch (error) {
            this.logger.error(`Failed to connect --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }

    deconnexion(id: string): void {
        this.connectedUsers.delete(id);
    }

    // async connexionToAdmin(password: string): Promise<boolean> {
    //     try {
    //         console.log(password + 'qdsdss');
    //         if (password !== 'admin') throw new Error('Wrong password');
    //         return Promise.resolve(password === 'admin');
    //     } catch (error) {
    //         this.logger.error(`Failed to connect --> ${error.message}`);
    //         return Promise.reject(`${error}`);
    //     }
    // }
}

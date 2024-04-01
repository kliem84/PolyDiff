/* eslint-disable @typescript-eslint/no-explicit-any */
import { Account } from '@app/model/database/account';
import { AccountManagerService } from '@app/services/account-manager/account-manager.service';
import { Friend, User } from '@common/game-interfaces';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FriendManagerService {
    constructor(private readonly accountManager: AccountManagerService) {}

    async queryUsers(): Promise<User[]> {
        await this.accountManager.fetchUsers();
        const users: User[] = [];
        this.accountManager.users.forEach((value, key) => {
            users.push({
                name: value.credentials.username,
                accountId: key,
                friends: value.profile.friends as unknown as Friend[],
                friendRequests: value.profile.friendRequests,
            });
        });
        return users;
    }

    async sendFriendRequest(senderFriendId: string, potentialFriendId: string): Promise<void> {
        const potentialFriendAccount = await this.accountManager.accountModel.findOne({ id: potentialFriendId });
        potentialFriendAccount.profile.friendRequests.push(senderFriendId);
        await potentialFriendAccount.save();
        this.accountManager.users.get(potentialFriendId).profile.friendRequests.push(senderFriendId);
    }

    async cancelRequest(senderFriendId: string, potentialFriendId: string): Promise<void> {
        const potentialFriendAccount = await this.accountManager.accountModel.findOne({ id: potentialFriendId });
        // Remove sender from potential's friend requests
        potentialFriendAccount.profile.friendRequests.find((id, index) => {
            if (senderFriendId === id) {
                potentialFriendAccount.profile.friendRequests.splice(index, 1);
            }
        });
        await potentialFriendAccount.save();
    }

    async optFriendRequest(potentialFriendId: string, senderFriendId: string, isOpt: boolean): Promise<void> {
        const potentialFriendAccount = await this.accountManager.accountModel.findOne({ id: potentialFriendId });
        const senderFriendAccount = await this.accountManager.accountModel.findOne({ id: senderFriendId });
        if (isOpt) {
            // Calculate common friends
            const commonFriends: Friend[] = this.calculateCommonFriends(senderFriendAccount, potentialFriendAccount);

            // Add friend in potential's friends
            const potentialFriend: Friend = {
                name: potentialFriendAccount.credentials.username,
                accountId: potentialFriendId,
                friends: [],
                commonFriends,
            };
            // Add friend in sender's friends
            const senderFriend: Friend = {
                name: senderFriendAccount.credentials.username,
                accountId: senderFriendId,
                friends: [],
                commonFriends,
            };

            senderFriendAccount.profile.friends.push(potentialFriend);
            potentialFriendAccount.profile.friends.push(senderFriend);
        }
        // Remove sender from potential's friend requests
        potentialFriendAccount.profile.friendRequests.find((id, index) => {
            if (senderFriendAccount.id === id) {
                potentialFriendAccount.profile.friendRequests.splice(index, 1);
            }
        });
        await potentialFriendAccount.save();
        await senderFriendAccount.save();
        // await this.updateAllUsersFoFs(potentialFriendAccount, senderFriendAccount);
        // await this.updateAllUsersCommonFriends(potentialFriendAccount, senderFriendAccount);
    }

    async updateAllUsersFoFs(excludeAccount1, excludeAccount2) {
        this.accountManager.users.forEach(async (user) => {
            if (user.id !== excludeAccount1.id && user.id !== excludeAccount2.id) await this.updateUserFoFs(user);
        });
    }

    // ******** Update friends of friends of 1 USER *********
    async updateUserFoFs(userAccount: any) {
        const friends = userAccount.profile.friends;
        const friendsOfFriends = new Set();

        for (const friendRef of friends) {
            const friendAccount = await this.accountManager.accountModel.findOne({ id: friendRef.accountId });
            for (const foFRef of friendAccount.profile.friends) {
                if (foFRef.accountId !== userAccount.id) {
                    friendsOfFriends.add({ name: foFRef.name, accountId: foFRef.accountId });
                }
            }
        }

        await userAccount.save();
    }

    async updateAllUsersCommonFriends(excludeAccount1, excludeAccount2) {
        this.accountManager.users.forEach(async (user) => {
            if (user.id !== excludeAccount1.id && user.id !== excludeAccount2.id) await this.updateCommonFriends(user);
        });
    }

    // ********* Update common friends of each friend of 1 USER *********
    async updateCommonFriends(userAccount: any) {
        const friends = userAccount.profile.friends;
        for (const friendRef of friends) {
            const friendAccount = await this.accountManager.accountModel.findOne({ id: friendRef.accountId });
            const commonFriends = this.calculateCommonFriends(userAccount, friendAccount);
            friendRef.commonFriends = commonFriends;
        }
        await userAccount.save();
    }

    async deleteFriend(senderFriendId: string, friendId: string): Promise<void> {
        const senderAccount = await this.accountManager.accountModel.findOne({ id: senderFriendId });
        const friendAccount = await this.accountManager.accountModel.findOne({ id: friendId });
        // Remove friend from sender's friends
        senderAccount.profile.friends.find((friend, index) => {
            if (friend.accountId === friendId) {
                senderAccount.profile.friends.splice(index, 1);
            }
        });
        // Remove sender from friend's friends
        friendAccount.profile.friends.find((friend, index) => {
            if (friend.accountId === senderFriendId) {
                friendAccount.profile.friends.splice(index, 1);
            }
        });
        await senderAccount.save();
        await friendAccount.save();
    }

    async deleteAllFriends() {
        const accounts = await this.accountManager.accountModel.find();
        accounts.forEach(async (account) => {
            account.profile.friends = [];
            await account.save();
        });
    }

    calculateCommonFriends(sender: Account, potential: Account): Friend[] {
        const commonFriends: Friend[] = [];
        sender.profile.friends.forEach((senderFriend) => {
            potential.profile.friends.forEach((friendFriend) => {
                if (senderFriend.accountId === friendFriend.accountId && sender.id !== friendFriend.accountId) {
                    commonFriends.push({
                        name: this.accountManager.users.get(friendFriend.accountId).credentials.username,
                        accountId: friendFriend.accountId,
                    });
                }
            });
        });
        return commonFriends;
    }

    calculatePendingFriends(potentialFriendId: string): Friend[] {
        const pendingFriends: Friend[] = [];
        this.accountManager.users.get(potentialFriendId).profile.friendRequests.forEach(async (id) => {
            pendingFriends.push({
                name: this.accountManager.users.get(id).credentials.username,
                accountId: id,
            });
        });
        return pendingFriends;
    }

    calculateSentFriends(senderFriendId: string): Friend[] {
        const sentFriends: Friend[] = [];
        const allAccounts: Account[] = Array.from(this.accountManager.users.values());
        allAccounts.forEach((account) => {
            account.profile.friendRequests.forEach((id) => {
                if (id === senderFriendId) {
                    sentFriends.push({
                        name: account.credentials.username,
                        accountId: account.id,
                    });
                }
            });
        });
        return sentFriends;
    }

    async optFavorite(id: string, friendId: string, isFavorite: boolean): Promise<void> {
        const account = await this.accountManager.accountModel.findOne({ id });
        account.profile.friends.find((friend) => {
            if (friend.accountId === friendId) {
                friend.isFavorite = isFavorite;
            }
        });
        await account.save();
    }
}
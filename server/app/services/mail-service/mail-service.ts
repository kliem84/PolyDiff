import { Account, AccountDocument } from '@app/model/database/account';
import { MAX_ACCESS_CODE, MIN_ACCESS_CODE } from '@common/constants';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MailService {
    constructor(
        private mailerService: MailerService,
        private readonly logger: Logger,
        @InjectModel(Account.name) private readonly accountModel: Model<AccountDocument>,
    ) {}

    async sendUserConfirmation(user: Account) {
        // const url = `example.com/auth/confirm?token=${token}`;
        await this.mailerService.sendMail({
            to: user.credentials.email,
            from: 'TeamRaccoon@polymtl.ca',
            subject: 'Oubli de mot de passe',
            html: `<p>Dear ${user.credentials.username},</p>
            <p>Your code to reset your password is:
            <div>${user.credentials.recuperatePasswordCode}</div>`,
            // template: 'confirmation',
            context: {
                name: user.credentials.username,
                // url: `http://localhost:3000:3000/confirm-password?token=${token}`,
            },
        });
    }

    async signUp(mail: string) {
        try {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            const accountFound = await this.accountModel.findOne({ 'credentials.email': mail });

            if (!accountFound) throw new Error('Account not found');

            accountFound.credentials.recuperatePasswordCode = Math.floor(MIN_ACCESS_CODE + Math.random() * MAX_ACCESS_CODE).toString();
            // await this.mailService.sendUserConfirmation(accountFound);
            await this.sendUserConfirmation(accountFound);
            await accountFound.save();
            this.logger.verbose(`send a mail with this adress  ${accountFound.credentials.email} `);
            return Promise.resolve(accountFound);
        } catch (error) {
            this.logger.error(`Failed to send mail --> ${error.message}`);
            return Promise.reject(`${error}`);
        }
    }
}

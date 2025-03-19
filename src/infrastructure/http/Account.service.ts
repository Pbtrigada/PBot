import { IAccountService } from "@app";
import { BotConfig } from "@config";
import { Account } from "@domain";
import axios from "axios";
import { injectable } from "inversify";



@injectable()
export class AccountService implements IAccountService {


    private readonly gameUrl: string;

    constructor() {
        this.gameUrl = BotConfig.gameUrl;
    }

    async register(chatId: string, refLink?: string): Promise<void> {
        await axios.post(this.gameUrl + `/account/reg`, {chatId : chatId, referalId : refLink});
    }
    async getAccount(chatId: string): Promise<Account> {
        const response = await axios.get<Account>(this.gameUrl + `/account/${chatId}`,);
        return response.data;
    }
}
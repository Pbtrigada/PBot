import { Account } from "@domain";

export interface IAccountService {
    register(chatId : string, refLink? : string): Promise<void>;
    getAccount(chatId : string) : Promise<Account>;
}
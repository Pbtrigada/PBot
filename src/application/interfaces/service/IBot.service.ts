import { ArticleData } from "@domain";

export interface IBotService {
    createInvoiceLink(data: ArticleData): Promise<string>;
    sendMessage(chatId : string, message : string, extra? : any) : Promise<void>;
}
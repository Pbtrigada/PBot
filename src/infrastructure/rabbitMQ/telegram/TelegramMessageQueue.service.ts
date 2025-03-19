import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { injectable } from "inversify";

import { BotConfig, TelegramQueueOptions } from "@config";
import { AbstractQueuePublisherService } from "../AbstractQueuePublisher.service";

type Message = {
    chatId: number | string,
    text: string,
    extra?: ExtraReplyMessage,
    isReply? : boolean,
    update? : any
}

interface TelegrafBot {
    telegram: {
        sendMessage(chatId : string, text : string, extra? : ExtraReplyMessage ): unknown;
        sendVideo(chatId : string, file_id : string, extra? : any) : unknown;
        sendPhoto(chatId : string, file_id : string, extra? : any) : unknown;
    }
}

@injectable()
export class TelegramMessageQueue extends AbstractQueuePublisherService {

    private bot : TelegrafBot;

    constructor() {
        super(TelegramQueueOptions);
    }

    setBot(bot : TelegrafBot) {
        this.bot = bot;
    }

    /** Обработка сообщения из очереди */
    protected async messageHandle(msg: Message): Promise<void> {
        try {
            await this.bot.telegram.sendMessage(String(msg.chatId), msg.text, msg.extra);
        } catch (e) {
            try {
                const response = e.response;
                if (response.error_code === 429) {
                    await this.bot.telegram.sendMessage(BotConfig.admin, `ОШИБКА ОТПРАВКИ СООБЩЕНИЯ \n ${JSON.stringify(e)}`);        
                }
                if (response.error_code === 403) {

                }
            } catch(e) {

            }
        }
    }

    /** Ставим сообщение в очередь */
    async push (message : Message) : Promise<void> {
        await this.sendMessage(message);
    }
}
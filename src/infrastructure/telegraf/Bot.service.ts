import { inject, injectable } from "inversify";
import { Context, Telegraf } from "telegraf";
import { Update, Message } from "telegraf/typings/core/types/typegram";
import { CommandContextExtn } from "telegraf/typings/telegram-types";
import rateLimit from "telegraf-ratelimit";

import { ArticleData, PaymentLinkdata } from "@domain";
import { PaymentQueueService, TelegramMessageQueue } from "@infrastructure";
import { IBotService, IAccountService, IPaymentService } from "@app";
import { BotConfig } from "@config";

@injectable()
export class BotService implements IBotService {

    private bot : Telegraf;

    constructor(
        @inject(TelegramMessageQueue) private readonly queue : TelegramMessageQueue,
        @inject("IAccountService") private readonly accountService : IAccountService,
        @inject("IPaymentService") private readonly paymentService : IPaymentService,
        @inject(PaymentQueueService) private readonly paymentQueueService : PaymentQueueService 
    ) {
    }

    setBot(bot: Telegraf) {
        this.bot = bot;
        
        const limitConfig = {
            window: 1 * 500,
            limit: 1,
            onLimitExceeded: async (ctx, next) => {
                console.log(`Превышен лимит запросов ${ctx.message.chat.id}`);
            }
        }
        bot.use(rateLimit(limitConfig));
        bot.command("start", this.startCommand);
        bot.on("pre_checkout_query", this.preCheckoutEvent);
        bot.on("successful_payment", this.successfulPaymentEvent);
    }

    async createInvoiceLink(data: ArticleData): Promise<string> {
        const amount: number = parseInt(String(data.ariclePrice));
        const paymentLinkData: PaymentLinkdata = {
            provider_token: "",
            title: `${data.articleName}`,
            description: `${data.articleName}`,
            payload: `${JSON.stringify({ articleId: data.articleId })}`,
            currency: "XTR",
            prices: [{ amount, label: `buy` }]
        }
        const paylentLink = await this.bot.telegram.createInvoiceLink(
            {
                currency: paymentLinkData.currency,
                description: paymentLinkData.description,
                payload: paymentLinkData.payload,
                prices: paymentLinkData.prices,
                provider_token: "",
                title: paymentLinkData.title,
            }
        );
        return paylentLink;
    }
    
    async sendMessage(chatId: string, message: string, extra?: any): Promise<void> {
        await this.queue.push({
            chatId : chatId,
            text : message,
            extra : extra,
            isReply : false,
        })
    }

    private async startCommand (ctx: Context<{ message: Update.New & Update.NonChannel & Message.TextMessage; update_id: number; }> & Omit<Context<Update>, keyof Context<Update>> & CommandContextExtn) : Promise<void> {
        let text = "HELLO!";
        let errorText = "Error";
        const chatId = String(ctx.message.chat.id);
        try {
            let answer : boolean = true;
            let refLink : string;
            const account = await this.accountService.getAccount(chatId);
            if (!account) {
                refLink = ctx.message.text.split(' ')[1];
                let referalId : string;
                if (refLink) {
                    referalId = refLink;
                }
                await this.accountService.register(chatId, refLink);                
            }
            await this.sendMessage(chatId,text);   
        } catch(e) {
            await this.sendMessage(chatId,errorText);
            console.log(`Ошибка команды старт с chatId - ${ctx.message.chat.id} ${e} `);
        }
    }

    private async successfulPaymentEvent(ctx : any) : Promise<void> {
        if (!ctx.message || !ctx.message.successful_payment || !ctx.from) {
            return;
        }
        try {
            const data = {
                chatId: String(ctx.from.id),
                currency: ctx.message.successful_payment.currency,
                amount: ctx.message.successful_payment.total_amount,
                payload: JSON.parse(ctx.message.successful_payment.invoice_payload)
            }
            if (data.currency !== "XTR") {
                return;
            }
            await this.paymentQueueService.push({comment : data.payload, currency : data.currency, value : data.amount});
        } catch(e) {
            await this.sendMessage(BotConfig.admin, `PAYMENT ERROR ${e}`);
        }
    }

    private async preCheckoutEvent (ctx : any) : Promise<void> { 
        setTimeout(async() => {
          try {
            const data = { 
              chatId : String(ctx.from.id),
              currency : ctx.preCheckoutQuery.currency,
              amount : ctx.preCheckoutQuery.total_amount,
              payload : JSON.parse(ctx.preCheckoutQuery.invoice_payload)
            }
            await this.paymentService.checkoutPayment(data);
            await ctx.answerPreCheckoutQuery(true); 
          } catch(e) {
            try {
              await ctx.answerPreCheckoutQuery(false); 
            } catch(e) {
              console.log(`PRE FALSE ERR  - ${e}`);
            }
          }
        }, 1500); 
        return;
    }

}
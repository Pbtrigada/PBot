import { Telegraf } from "telegraf";
import { InversifyExpressServer } from "inversify-express-utils";
import express from "express";
import cors from "cors";

import { beforeMiddleware, errorMiddleware } from "./middlewares";
import { container } from "./container";
import { BotConfig } from "../../config";
import { BotService, TelegramMessageQueue } from "../../infrastructure";

const botInstanse = new Telegraf(BotConfig.key);
const serverInstanse = new InversifyExpressServer(container);

const corsOptions = {};

serverInstanse.setConfig((app)=> {
    app.use(express.json());
    app.use(cors(corsOptions));
    app.use(beforeMiddleware);
});

serverInstanse.setErrorConfig( (app)=>{
    app.use(errorMiddleware);
});

export const start = async ()=> {
    try {
        const telegramMessageQueue = container.get<TelegramMessageQueue>(TelegramMessageQueue);
        const botService = container.get<BotService>(BotService);

        telegramMessageQueue.setBot(botInstanse);
        botService.setBot(botInstanse);
        const app = serverInstanse.build();
        app.listen(BotConfig.port, async () => {try {console.log(`BOT Server is running at ${BotConfig.port}`);} catch(e) {console.log(e);}});
        botInstanse.launch({dropPendingUpdates: true});
        process.once('SIGINT', () => {shutdown("SIGINT");});
        process.once('SIGTERM', () => {shutdown('SIGTERM');});
        process.once('SIGINIT', () => {shutdown('SIGINIT');});
    } catch(e) {
      console.log(e);
    }
  
    function shutdown(signal : string) {
      botInstanse.telegram.sendMessage(BotConfig.admin,`SIGNAL IS - ${signal}`);
      try {
        botInstanse.stop();
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    }
}
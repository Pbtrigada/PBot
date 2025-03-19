import {Markup} from "telegraf";
import { BotConfig } from "../../config";

export const webButton = Markup.inlineKeyboard([
    [
        Markup.button.webApp("PLAY NOW", BotConfig.webapp_url)
    ]
]);



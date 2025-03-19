import { controller, httpGet, httpPost } from "inversify-express-utils";
import { NextFunction, Request, Response } from "express";
import { inject } from "inversify";

import { IBotService } from "@app";
import { BotConfig } from "@config";
import { ArticleData } from "@domain";


@controller("bot")
export class BotController {

    constructor(
        @inject("IBotService") private readonly bot : IBotService
    ) {
    }


    @httpPost("/paylink")
    async getPaylink(req: Request, res: Response, next: NextFunction) {
        try {
            const articleData: ArticleData = req.body;
            const invoiceLink = await this.bot.createInvoiceLink(articleData);
            res.json({ message: invoiceLink }).status(200);
        } catch (e) {
            next(e);
        }
    }

    @httpGet("/send") 
    async sendMessage(req : Request,res : Response, next : NextFunction) {
        try {
            const {id,message} = req.query;
            await this.bot.sendMessage(String(id), String(message));
            return res.json({message : "ok"}).status(200);
          }  catch(e) {
            next(e);
        }
    }
     
    @httpGet("/link") 
    async referalLink(req : Request,res : Response, next : NextFunction) {
        try {
            const {chat,id} = req.query;
            const text = `${BotConfig.bot_url}?start=${id}\n\n` +
            `Hello, my friend 👋🏻\n\n` +
            `Залетай на нашу спортивную базу, прокачивай своего персонажа, добывай токены и ценные призы ⭐️⭐️⭐️`;
            await this.bot.sendMessage(String(chat), text, {parse_mode: 'HTML'} );   
            return res.json({message : "ok"}).status(200);
          }  catch(e) {
            next(e);
        }
    }
    
    @httpGet("/health") 
    async health(req:Request,res:Response, next : NextFunction) {
          try {
          return res.status(200).json({message : "bot - ok"})
        }  catch(e) {
          next(e);
      }
    }; 

    @httpGet("*") 
    async unknown(req:Request,res:Response) {
        try {
            console.log(`${req.url} - unknown`);
            return res.status(200).json({message : "bot - unknown" })  
        } catch(e) {
            console.log(e);
            return res.status(500).json({message : "bot - false" })  
        }
    }   
}
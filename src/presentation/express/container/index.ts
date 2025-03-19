import { Container } from "inversify";
import { BotController } from "../controller";
import { 
    AccountService,
    ApproveCompleteQueueService, ApproveQueueService, BotService,
    PaymentQueueService, PaymentService, TelegramMessageQueue, TonService } from "@infrastructure";
import { IBotService, IAccountService, IPaymentService , ITonService } from "@app";



export const container = new Container();

container.bind<BotController>(BotController).toSelf();
container.bind<TelegramMessageQueue>(TelegramMessageQueue).toSelf().inSingletonScope();
container.bind<IBotService>("IBotService").to(BotService);
container.bind<IPaymentService>("IPaymentService").to(PaymentService);
container.bind<IAccountService>("IAccountService").to(AccountService);
container.bind<PaymentQueueService>(PaymentQueueService).toSelf().inSingletonScope();
container.bind<ApproveCompleteQueueService>(ApproveCompleteQueueService).toSelf().inSingletonScope();
container.bind<ApproveQueueService>(ApproveQueueService).toSelf().inSingletonScope();
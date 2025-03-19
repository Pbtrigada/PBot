import { inject, injectable } from "inversify";
import { AbstractQueueConsumerService } from "../AbstractQueueConsumer.service";
import { ApproveQueueOptions } from "@config";
import { ITonService } from "@app";
import { TransactionTo } from "@domain";


injectable()
export class ApproveQueueService extends AbstractQueueConsumerService {
    
    constructor(
        @inject("ITonService") private readonly tonService : ITonService
    ) {
        super(ApproveQueueOptions)
    }

    /** Получаем из очереди сообщение о запросе и обрабатываем в сервисе  */
    protected async messageHandle(msg : TransactionTo) : Promise<void> {
        await this.tonService.transactTo(msg);
    }
}
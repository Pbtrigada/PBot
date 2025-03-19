import { injectable } from "inversify";
import { AbstractQueuePublisherService } from "../AbstractQueuePublisher.service";
import { ApproveCompleteOptions } from "@config";
import { TransactionTo } from "@domain";

interface Transaction extends TransactionTo {
    isComplete : boolean;

}

@injectable()
export class ApproveCompleteQueueService extends AbstractQueuePublisherService {


    constructor() {
        super(ApproveCompleteOptions);    
    }

    /** Пушим в очередь сообщение о завершенном выводе тон */
    async push(message: Transaction): Promise<void> {
        await this.sendMessage(message);
    }
}
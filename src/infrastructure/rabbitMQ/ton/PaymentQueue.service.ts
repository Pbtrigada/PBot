import { injectable } from "inversify";
import { PaymentQueueOptions } from "src/config";
import { AbstractQueuePublisherService } from "../AbstractQueuePublisher.service";


type Transaction = {
    comment : string;
    value : string;
    currency : string;
}



@injectable()
export class PaymentQueueService extends AbstractQueuePublisherService {
    

    constructor() {
        super(PaymentQueueOptions);
    }

    /** Получили платеж и пушим его в очередь */
    async push(message: Transaction): Promise<void> {
        await this.sendMessage(message);
    }
}
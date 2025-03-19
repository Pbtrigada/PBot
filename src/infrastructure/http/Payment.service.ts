import { injectable } from "inversify";
import axios from "axios";
import { IPaymentService } from "@app";
import { PaymentResultData } from "@domain";
import { BotConfig } from "@config";

@injectable()
export class PaymentService implements IPaymentService {
    

    private readonly gameUrl : string;

    constructor() {
        this.gameUrl = BotConfig.gameUrl;
    }

    async checkoutPayment(data: PaymentResultData): Promise<void> {
        await axios.post(this.gameUrl + `payment/star/pre`, data);
    }
}
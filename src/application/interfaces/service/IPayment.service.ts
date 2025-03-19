import { PaymentResultData } from "@domain";


export interface IPaymentService {
    /* Это чекаут для платежки старом */
    checkoutPayment(data: PaymentResultData): Promise<void>;
}
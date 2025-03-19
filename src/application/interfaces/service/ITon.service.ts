import { TransactionTo } from "@domain";

export interface ITonService {
    /** Отправка денег на адрес с коментарием */
    transactTo(msg: TransactionTo): Promise<void>;
}
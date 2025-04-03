import { inject, injectable } from "inversify";
import TonWeb from 'tonweb';
import {
    validate as uuidValidate,
    version as uuidVersion,
  } from 'uuid';
import { ITonService } from "@app";
import { ApproveCompleteQueueService, PaymentQueueService } from "../rabbitMQ" 
import { TransactionTo } from "@domain";


type Transaction = {
    comment : string;
    value : string;
    currency : string;
}

@injectable()
export class TonService implements ITonService {


    private isProcessing = false;
    private startTime = 0;
    private tonweb : TonWeb;
    private INPUT_WALLET_ADDRESS : string;
    private OUTPUT_WALLET_ADDRESS : string;

    constructor(
        @inject(PaymentQueueService) private readonly paymentQueue : PaymentQueueService,
        @inject(ApproveCompleteQueueService) private readonly approveCompleteQueue : ApproveCompleteQueueService        
    ) {
        this.tonweb = new TonWeb(new TonWeb.HttpProvider('https://toncenter.com/api/v2/jsonRPC', {
          apiKey: process.env.TONWEB_API_KEY,
        }));
    }

    

    

    /** Нужно совершить перевод тон человеку */
    public async transactTo(msg: TransactionTo): Promise<void> {
        try {
            /// TODO : transfer ton to address
            await this.approveCompleteQueue.push({...msg, isComplete : true});
        } catch (e) {
            await this.approveCompleteQueue.push({...msg, isComplete : false});
        }
    }

    /** Нашли транзакцию и отпраляем уведомление */
    private async push (transaction : Transaction ) : Promise<void> {
        await this.paymentQueue.push(transaction);
    }

    init() {
        setInterval(async () => {
            if (this.isProcessing) {
                return;
            }
                this.isProcessing = true;
        
          try {
            const result = await this.getTransactions(undefined, undefined, undefined, 0);
            if (result > 0) {
              this.startTime = result;
            }
          } catch (e) {
            console.error('setInterval()', e);
          }
        
          this.isProcessing = false;
        }, 10 * 1000);
    }



    private async getTransactions(time, offsetTransactionLT, offsetTransactionHash, retryCount : number) {
        const COUNT = 50;
      
        let transactions;
        try {
          transactions = await this.tonweb.provider.getTransactions(
            this.userFriendlyAddress(this.INPUT_WALLET_ADDRESS), 
            COUNT, 
            offsetTransactionLT, 
            offsetTransactionHash, 
            0, 
            true);

        } catch (e) {
          console.error('getTransactions()', e);

          retryCount++;
          if (retryCount < 10) {
            await this.wait(retryCount * 1000);
            return this.getTransactions(time, offsetTransactionLT, offsetTransactionHash, retryCount);
          } else {
            return 0;
          }
        }
        console.log(`Got ${transactions.length} transactions`);
      
        if (!transactions.length) return time;
      
        if (!time) time = transactions[0].utime;
      
        for (const tx of transactions) {
          if (tx.utime < this.startTime) return time;
      
          await this.onTransaction(tx);
        }
      
        if (transactions.length === 1) return time;
      
        const lastTx = transactions[transactions.length - 1];
        return await this.getTransactions(time, lastTx.transaction_id.lt, lastTx.transaction_id.hash, 0);
      }


      private isUuidV4Valid(uuid) {
        return uuidValidate(uuid) && uuidVersion(uuid) === 4;
      }
    private userFriendlyAddress(address) {
        if (TonWeb.Address.isValid(address)) {
            return new TonWeb.Address(address).toString(true, true, true);
        } else {
            return '';
        }
    }
    private wait(millis) {
        return new Promise(resolve => {
            setTimeout(resolve, millis);
        });
    }

    /** Обработка транзакции */
    private async onTransaction(tx) {
      if (
            tx.in_msg.source && 
            this.userFriendlyAddress(tx.out_msgs[0]?.source) === this.userFriendlyAddress(this.INPUT_WALLET_ADDRESS) && 
            this.userFriendlyAddress(tx.out_msgs[0]?.destination) === this.userFriendlyAddress(this.OUTPUT_WALLET_ADDRESS)) {
        if (tx.in_msg.msg_data && tx.in_msg.msg_data['@type'] !== 'msg.dataText') {
          return;
        }
    
        const comment = tx.in_msg.message;
        if (!this.isUuidV4Valid(comment)){
          return;
        }
    
        const senderWalletAddress = tx.in_msg.source;
        const value = TonWeb.utils.fromNano(tx.in_msg.value);
    
        try {
          await this.push({comment : comment, value : value, currency : "TON"});
          console.log(`Receive ${value} TON from ${this.userFriendlyAddress(senderWalletAddress)} with comment "${comment}"`);
        } catch (e) {
          console.error('onTransaction()', e);
        }
      }
    }
}
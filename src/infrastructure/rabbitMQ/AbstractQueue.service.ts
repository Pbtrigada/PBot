import { Channel, ChannelWrapper, default as amqp } from 'amqp-connection-manager';
import type { ConsumeMessage } from 'amqplib';
import { Options } from './options';
import { Queue } from './Queue.core';



/**
 * Если limitSpeedBatchPerSec = 0, то отправляцет сообщения последовательно по одному без ограничения на скорость отправки.
 * Если limitSpeedBatchPerSec > 0, то отправляет сообщения пакетами. Пакеты отправляются последовательно. Сообщения в пакете отправляются параллельно.
 * Для каждого сообщения делается maxAttemptsSendMsg попыток отправки.
 *
 * https://amqp-node.github.io/amqplib/channel_api.html
 */
export abstract class AbstractMessageQueue {
    private channel: ChannelWrapper;
    private alreadyInit = false;
    private readonly msgBuffer: Queue<ConsumeMessage>;
    private timerId: NodeJS.Timeout;
    private readonly useMsgBuffer: boolean;

    constructor(
        private readonly opt : Options,
    ) {
        this.useMsgBuffer = !!opt.limitSpeedBatchPerSec;
        this.msgBuffer = new Queue<ConsumeMessage>();
    }

    /** Подписка на канал */
    private async createConsume(): Promise<void> {
        await this.channel.consume(
            this.opt.queue,
            async (rabbitMsg: ConsumeMessage) => {
                if (rabbitMsg !== null) {
                    if (this.useMsgBuffer) {
                        this.msgBuffer.enqueue(rabbitMsg);
                    } else {
                        await this.handleRabbitMessage(rabbitMsg);
                    }
                }
                if (!this.opt.noAck) { // Подтверждение сообщения только если noAck = false
                    this.channel.ack(rabbitMsg);
                }
            },
            { prefetch: this.opt.prefetch, noAck : this.opt.noAck },
        );
    }

    /** Открытие канала */
    private async init(): Promise<void> {
        this.channel = await this.createChannel();
        await this.createConsume();
        if (this.useMsgBuffer) {
            const intervalMs = 1000 / this.opt.limitSpeedBatchPerSec;
            this.timerId = setInterval(async () => {
                await this.takeFromMsgBuffer();
            }, intervalMs);
        }
        this.alreadyInit = true;
    }
    
    /** Отбработка полученного собщения */
    private async handleRabbitMessage(rabbitMsg: ConsumeMessage): Promise<void> {
        const content = JSON.parse(rabbitMsg.content?.toString('utf8')) ?? {};
        const msg = content?.data ?? {};
        let successSending = false;
        let attemptsSendMsg = 0;
        do {
            attemptsSendMsg++;
            try {
                await this.messageHandle(msg);
                if (!this.opt.noAck) {
                    this.channel.ack(rabbitMsg);
                }
                successSending = true;
            } catch (e) {
                console.log(`${new Date().toISOString()} :: MessageQueue :: Сообщение отправить не удалось (попытка ${attemptsSendMsg}) :: ${msg ? JSON.stringify(msg) : msg}`);
            }
        } while (attemptsSendMsg < this.opt.maxAttemptsSendMsg);
        if (!successSending && !this.opt.noAck && this.opt.askHaveNotBeenSentMsg) {
            this.channel.ack(rabbitMsg);
        }
    }

    /** Получение сообщений из буффера */
    private async takeFromMsgBuffer(): Promise<void> {
        const arrPromises = this.msgBuffer.dequeue(this.opt.sizeBatch)
            .filter(rabbitMsg => !!rabbitMsg)
            .map((rabbitMsg) => { return this.handleRabbitMessage(rabbitMsg);});
        await Promise.all(arrPromises);
    }

    /** Отправка сообщения в очередь */
    protected async sendMessage<T>(msg : T): Promise<void> {
        if (!this.alreadyInit) await this.init();
        await this.channel.sendToQueue(this.opt.queue, {
            pattern: this.opt.pattern,
            data: msg,
        });
    }

    /** Подключение к серверу и создание очереди */
    private async createChannel(): Promise<ChannelWrapper> {
        const connection = await amqp.connect([this.opt.url]);
        const channel = await connection.createChannel({
            json: true,
            setup: async (channel: Channel) => {
                await channel.assertQueue(this.opt.queue, {
                    durable: this.opt.durable,
                });
            },
        });
        return channel;
    }

    protected async messageHandle(arg: any): Promise<void> {
    }
}




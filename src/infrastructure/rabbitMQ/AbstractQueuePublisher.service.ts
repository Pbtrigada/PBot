import { Channel, ChannelWrapper, default as amqp } from 'amqp-connection-manager';
import { Options } from './options';



export abstract class AbstractQueuePublisherService {
 

    private channel: ChannelWrapper;
    private alreadyInit = false;

    constructor(
        private readonly opt : Options,
    ) {
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

    /** Отправка сообщения в очередь */
    protected async sendMessage<T>(msg: T): Promise<void> {
        if (!this.alreadyInit) await this.init();
        await this.channel.sendToQueue(this.opt.queue, {
            pattern: this.opt.pattern,
            data: msg,
        });
    }
    
    /** Открытие канала */
    private async init(): Promise<void> {
        this.channel = await this.createChannel();
        this.alreadyInit = true;
    }
}
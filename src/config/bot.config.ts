

export const BotConfig = {
    bot_url : process.env.BOT_BOT_URL,
    webapp_url : process.env.WEBAPP_URL, 
    port : Number(process.env.BOT_PORT) || 80,
    admin : "",
    key : process.env.BOT_KEY,
    gameUrl : process.env.GAME_URL,
}

export const AmqpUrl = {
    protocol: 'amqp',
    hostname: process.env.MESSAGE_QUEUE_URL_HOSTNAME ?? 'localhost',
    port: Number(process.env.MESSAGE_QUEUE_URL_PORT ?? 5672),
    username: process.env.MESSAGE_QUEUE_URL_USERNAME ?? 'guest',
    password: process.env.MESSAGE_QUEUE_URL_PASSWORD ?? 'guest',
    vhost: process.env.MESSAGE_QUEUE_URL_VHOST ?? '',
    heartbeat: Number(process.env.MESSAGE_QUEUE_URL_HEARTBEAT ?? 300),

}


export const TelegramQueueOptions = {
    url: AmqpUrl,
    queue: 'pizzatg',
    pattern: 'pizzamsg',
    prefetch: 1,
    durable: true,
    noAck: false,
    limitSpeedBatchPerSec: 30,
    maxAttemptsSendMsg: 1,
    askHaveNotBeenSentMsg: false,
    sizeBatch: 1,
}

export const PaymentQueueOptions = {
    url: AmqpUrl,
    queue: 'on-transaction-event',
    pattern: 'tonpayment',
    prefetch: 1,
    durable: true,
    noAck: false,
    limitSpeedBatchPerSec: 1,
    maxAttemptsSendMsg: 1,
    askHaveNotBeenSentMsg: false,
    sizeBatch: 1,
}

export const ApproveQueueOptions = {
    url: AmqpUrl,
    queue: 'on-approve',
    pattern: 'tonapprove',
    prefetch: 1,
    durable: true,
    noAck: false,
    limitSpeedBatchPerSec: 1,
    maxAttemptsSendMsg: 1,
    askHaveNotBeenSentMsg: false,
    sizeBatch: 1,
}

export const ApproveCompleteOptions = {
    url: AmqpUrl,
    queue: 'on-approve-complete',
    pattern: 'tonapprovecompelete',
    prefetch: 1,
    durable: true,
    noAck: false,
    limitSpeedBatchPerSec: 1,
    maxAttemptsSendMsg: 1,
    askHaveNotBeenSentMsg: false,
    sizeBatch: 1,
}
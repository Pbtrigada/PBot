
export type Options = {
    /** Наименование очереди */
    queue: string;
    /** По паттерну можно различить сообщения в очереди. Сейчас выставляется, но не проверяется. */
    pattern: string;
    /** Максимальное количество неподтвержденных сообщений (по-умолчанию: 1) */
    prefetch: number;
    /** Адрес и некоторые настройки рэббита */
    url: Url;
    /** If true, the queue will survive broker restarts; (по-умолчанию: да) */
    durable: boolean;
    /** Разрешает не подтверждать сообщения (по-умолчанию: нет). Чаще всего надо подтверждать, иначе рэббит сразу сольет все сообщения слушателю. */
    noAck: boolean;
    /** Ограничение скорости рассылки сообщений (0 - без ограничений) */
    limitSpeedBatchPerSec: number;
    /** Максимальное число попыток отправить сообщение (по-умолчанию: 1) */
    maxAttemptsSendMsg: number;
    /** Удалять ли из рэббита сообщения, которые не удалось отправить (по-умолчанию: нет). Имеет смысл только если noAck=false */
    askHaveNotBeenSentMsg: boolean;
    /** Размер пакета сообщений (по-умолчанию: 1); имеет смысл только <= prefetch и только с limitSpeedMsgPerSec */
    sizeBatch: number;
}

/** Адрес и некоторые настройки рэббита */
export type Url = {
    protocol?: string;
    hostname?: string;
    port?: number;
    username?: string;
    password?: string;
    vhost?: string;
    heartbeat?: number;
}



export interface PaymentLinkdata {
    provider_token : string;
    title : string;
    description : string;
    payload : string;
    currency : string;
    prices : Price[]
}

export interface Price {
    amount : number;
    label : string;
}
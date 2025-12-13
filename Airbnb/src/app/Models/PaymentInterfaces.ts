export interface PaymentIntentRequest {
    amount: number;
    currency: string;
    paymentMethodType: string;
    metadata?: any;
}

export interface PaymentIntentResponse {
    id: string;
    client_secret: string;
    status: string;
    payment_method?: string;
}

export interface ConfirmPaymentRequest {
    paymentIntentId: string;
    paymentMethodId?: string;
}

export interface PaymentApiResponse {
    id: string;
    type?: string;
    provider?: string;
    lastFour?: string;
    expiryDate?: string;
    isDefault?: boolean;
    description?: string;
    amount?: number;
    bookingId?: string;
    paymentMethodId?: string;
    date?: string;
    status?: string;
    method?: string;
    userId?: string;
}

export interface User {
    id: string;
    userName?: string;
    email?: string;
    phoneNumber?: string;
    photoURL?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string; // DateOnly is serialized as string usually
    work?: string;
    wantedToTravel?: string;
    pets?: string;
    uselessSkill?: string;
    showTheDecade?: boolean;
    funFact?: string;
    favoriteSong?: string;
    school?: string;
    spendTimeDoing?: string;
    location?: string;
    about?: string;

    // Navigation properties placeholders - can be expanded as needed
    userLanguage?: any[];
    userInterest?: any[];
    experience?: any[];
    expReviews?: any[];
    properties?: any[];
    bookings?: any[];
    services?: any[];
    serviceBookings?: any[];
    wishlists?: any[];
    reviews?: any[];
    sentMessages?: any[];
    receivedMessages?: any[];
    expReservations?: any[];
}

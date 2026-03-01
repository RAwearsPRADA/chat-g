export interface JWTPayload {
    nick: string;
    email: string;
    exp: number;
    iat: number;
}
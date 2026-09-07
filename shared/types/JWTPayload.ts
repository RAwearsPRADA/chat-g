export interface JWTPayload {
    nick: string;
    id: number;
    exp: number;
    iat: number;
}
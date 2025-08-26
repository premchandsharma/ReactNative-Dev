import { UserData } from '../sdk';
interface Attributes {
    [key: string]: any;
}
export declare const verifyUser: (user_id: string, campaigns: any[], attributes?: Attributes) => Promise<UserData | undefined>;
export {};
//# sourceMappingURL=verifyuser.d.ts.map
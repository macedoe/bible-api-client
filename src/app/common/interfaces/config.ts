export interface Config {
    api: {
        baseUrl: string;
    };
    settings: {
        idleTimeOutSeconds: number;
        alertTimeOutSeconds: number;
    };
}

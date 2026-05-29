export interface IConfig {
    connection: string;
    session: string;
    osuApp: {
        id: number;
        secret: string;
        redirect: string;
    };
    githubRepo?: string;
    discord?: {
        webhooks?: {
            main?: {
                id: string;
                token: string;
            };
            dev?: {
                id: string;
                token: string;
            };
        };
    };
}

interface RTBLogger {
    log(channel:string, ...optionalParams:any[]): void;
    enabled():boolean;
}
declare var log:RTBLogger;

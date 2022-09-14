export interface SyncInterface {
  syncTitle: string;

  sync(): Promise<boolean>;
}

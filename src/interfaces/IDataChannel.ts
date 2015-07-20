interface IDataChannel {
    readIds: () => ng.IPromise<number[]>;
    readIdsSortedBy: (field: string, direction: string) => ng.IPromise<number[]>;
    readRecords: (ids: number[]) => ng.IPromise<IRecord[]>;
    writeRecords: (records: IRecord[]) => ng.IPromise<void>;
    subscribe: (listener: IDataChannelListener) => number;
    unsubscribe: (token: number) => void;
}

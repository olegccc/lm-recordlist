interface IRecordListConfiguration {
    editRecord: (record: IRecord, resolver: (object: IRecord) => ng.IPromise<void>) => ng.IPromise<IRecord>;
    navigate: (url: string) => void;
    pageSize: number;
    errorHandler: (message: string) => void;
}

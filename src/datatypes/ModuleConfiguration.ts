class ModuleConfiguration {
    public createRecord: () => ng.IPromise<IRecord>;
    public updateRecord: (record: IRecord) => ng.IPromise<IRecord>;
    public navigate: (url: string) => void;
    public pageSize: number;
}
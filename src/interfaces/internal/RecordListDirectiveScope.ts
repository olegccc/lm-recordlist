interface RecordListDirectiveScope extends ng.IScope {
    modelId: string;
    channel: IDataChannel;
    currentPage: string;
    handleAction: (actionName: string, dataObject: any) => ng.IPromise<any>;
}

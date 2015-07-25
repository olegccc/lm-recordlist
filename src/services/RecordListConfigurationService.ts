class RecordListConfigurationService implements IRecordListConfiguration {

    constructor() {
        this.editRecord = null;
        this.navigate = null;
        this.pageSize = 10;
        this.errorHandler = null;
    }

    editRecord:(record:IRecord, resolver:(r:IRecord)=>angular.IPromise<void>)=>angular.IPromise<IRecord>;
    navigate:(p1:string)=>void;
    pageSize:number;
    errorHandler:(p1:string)=>void;
}

recordListModule.service('recordListConfiguration', [RecordListConfigurationService]);

interface TestControllerScope extends ng.IScope {
    dataChannel: IDataChannelFactory;
    actionHandler: (actionName: string, dataObject: any) => ng.IPromise<any>;
    pageHandler: (page?: string) => string;
}

class TestController {

    private webForms: IWebFormsService;
    private qService: ng.IQService;
    private scope: TestControllerScope;

    private createRecord(index: number): IRecord {
        var record = new TestRecord();
        record.field1 = "abc" + index;
        record.field2 = "def" + index;
        return record;
    }

    constructor(scope: TestControllerScope, webForms: IWebFormsService, qService: ng.IQService, recordListConfiguration: IRecordListConfiguration) {

        this.webForms = webForms;
        this.qService = qService;
        this.scope = scope;

        var dataStorage = new TestDataStorage(qService);
        scope.dataChannel = dataStorage;

        for (var i = 1; i < 40; i++) {
            dataStorage.writeRecords(null, [this.createRecord(i)]);
        }

        scope.actionHandler = (actionName: string, dataObject: TestRecord) => {

            switch (actionName) {
                case "create":
                    if (dataObject === null) {
                        break;
                    }
                    return dataStorage.writeRecords(null, [dataObject]);
                case "view":
                    alert(JSON.stringify(dataObject));
                    break;
                case "modifyRecord":
                    return dataStorage.writeRecords(null, [dataObject]);
                case "deleteRecord":
                    return dataStorage.deleteRecords(null, [dataObject.id]);
            }

            var defer = this.qService.defer<void>();
            defer.resolve();
            return defer.promise;
        };

        scope.pageHandler = null;

        recordListConfiguration.editRecord = (record: IRecord, resolver: (object: IRecord) => ng.IPromise<void>) => {
            return this.onEditRecord(record, resolver);
        };

        recordListConfiguration.errorHandler = (message: string) => {
            this.webForms.message(message, "Error");
        };
    }

    private onEditRecord (record: IRecord, resolver: (object: IRecord) => ng.IPromise<void>): ng.IPromise<IRecord> {
        return this.webForms.editObject<IRecord>('/test/models/recordModel', record, resolver);
    }
}

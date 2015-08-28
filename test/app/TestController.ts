interface TestControllerScope extends ng.IScope {
    dataChannel: IDataChannelFactory;
    actionHandler: (actionName: string, dataObject: any) => ng.IPromise<any>;
    pageHandler: (page?: string) => string;
}

class TestController {

    private webForms: IWebFormsService;

    private createRecord(index: number): IRecord {
        var record = new TestRecord();
        record.field1 = "abc" + index;
        record.field2 = "def" + index;
        return record;
    }

    constructor(scope: TestControllerScope, webForms: IWebFormsService, qService: ng.IQService, recordListConfiguration: IRecordListConfiguration) {
        this.webForms = webForms;
        var dataStorage = new TestDataStorage(qService);
        scope.dataChannel = dataStorage;

        for (var i = 1; i < 40; i++) {
            dataStorage.writeRecords(null, [this.createRecord(i)]);
        }

        scope.actionHandler = null;
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

class TestDataStorage implements IDataChannelFactory {

    private qService: ng.IQService;
    private records: {[id: number]: TestRecord };
    private subscriberId: number;
    private subscribers;
    private recordIdCounter: number;

    public constructor(qService: ng.IQService) {
        this.qService = qService;
        this.records = {};
        this.subscriberId = 1;
        this.subscribers = {};
        this.recordIdCounter = 1;
    }

    subscribe(listener:IDataChannelListener): IDataChannel {
        var wrapper = new TestDataChannel(this, listener, this.subscriberId, this.qService);
        this.subscribers[this.subscriberId] = wrapper;
        this.subscriberId++;
        return wrapper;
    }

    unsubscribe(channel: IDataChannel) {
        delete this.subscribers[(<TestDataChannel>channel).getId()];
    }

    getIds(): any[] {
        var ret = [];
        Object.keys(this.records).forEach((key) => {
            ret.push(this.records[key].id);
        });
        return ret;
    }

    getRecord(id): TestRecord {
        return this.records[id];
    }

    readRecords(ids:number[]): angular.IPromise<IRecord[]> {
        var deferred = this.qService.defer<IRecord[]>();

        var records = [];
        ids.forEach(function(id) {
            var record = this.records[id];
            if (record) {
                records.push(record);
            }
        });

        deferred.resolve(records);

        return deferred.promise;
    }

    deleteRecords(channelId: number, ids:any[]): angular.IPromise<void> {
        var deferred = this.qService.defer<void>();

        var removed = [];

        ids.forEach((id) => {
            var record = this.records[id];
            if (record) {
                removed.push(record.id);
                delete this.records[id];
            }
        });

        Object.keys(this.subscribers).forEach((channelId2) => {
            removed.forEach((id) => {
                this.subscribers[channelId].onRecordRemoved(id, channelId != +channelId2);
            });
        });

        return deferred.promise;
    }

    writeRecords(channelId: number, records:IRecord[]): angular.IPromise<void> {
        var deferred = this.qService.defer<void>();

        records.forEach((record: TestRecord) => {

            if (record.id) {

                var existingRecord = this.records[record.id];
                if (existingRecord) {
                    Object.keys(record).forEach((key) => {
                        existingRecord[key] = record[key];
                    });

                    Object.keys(this.subscribers).forEach((channelId2) => {
                        this.subscribers[channelId2].onRecordUpdated(record.id, +channelId2 != channelId);
                    });

                }
            } else {
                record.id = this.recordIdCounter++;
                var savedRecord = new TestRecord();
                Object.keys(record).forEach((key) => {
                    savedRecord[key] = record[key];
                });
                this.records[savedRecord.id] = savedRecord;

                Object.keys(this.subscribers).forEach((channelId2) => {
                    this.subscribers[channelId2].onRecordCreated(savedRecord.id, +channelId2 != channelId);
                });
            }
        });

        deferred.resolve();

        return deferred.promise;
    }
}
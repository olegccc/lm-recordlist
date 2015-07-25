class TestDataChannel implements IDataChannel {

    private channel: TestDataStorage;
    private id: number;
    private listener: IDataChannelListener;
    private recordIds: number[];
    private sortField: string;
    private ascending: boolean;
    private qService: ng.IQService;

    constructor(channel: TestDataStorage, listener: IDataChannelListener, id: number, qService: ng.IQService) {
        this.channel = channel;
        this.id = id;
        this.listener = listener;
        this.recordIds = [];
        this.ascending = true;
        this.sortField = null;
        this.qService = qService;
        this.refreshIds();
    }

    getId(): number {
        return this.id;
    }

    deleteRecords(ids:any[]): angular.IPromise<void> {
        return this.channel.deleteRecords(this.id, ids);
    }

    readRecords(ids:any[]): angular.IPromise<IRecord[]> {
        return this.channel.readRecords(ids);
    }

    readIds(): angular.IPromise<any[]> {
        var deferred = this.qService.defer<any[]>();
        deferred.resolve(this.recordIds);
        return deferred.promise;
    }

    sortByAndReadIds(field:string, ascending:boolean): angular.IPromise<any[]> {
        this.sortField = field;
        this.ascending = ascending;
        this.refreshIds();
        return this.readIds();
    }

    writeRecords(records:IRecord[]): angular.IPromise<void> {
        return this.channel.writeRecords(this.id, records);
    }

    refreshIds() {
        this.recordIds = this.channel.getIds();
        if (this.sortField) {
            this.recordIds.sort(function(id1, id2): number {
                var f1 = this.channel.getRecord(id1)[this.sortField];
                var f2 = this.channel.getRecord(id2)[this.sortField];

                if (f1 === f2) {
                    return 0;
                }

                if (f1 < f2) {
                    return this.ascending ? 1 : -1;
                }

                return this.ascending ? -1 : 1;
            });
        }
    }

    onRecordRemoved(id: any, notifySubscriber: boolean) {
        for (var i = 0; i < this.recordIds.length; i++) {
            if (this.recordIds[i] === id) {
                this.recordIds.splice(i, 1);
                if (notifySubscriber) {
                    this.listener.recordRemoved(id);
                }
                break;
            }
        }
    }

    onRecordUpdated(id: any, notifySubscriber: boolean) {

        this.refreshIds();

        if (!notifySubscriber) {
            return;
        }

        for (var i = 0; i < this.recordIds.length; i++) {
            if (this.recordIds[i] === id) {
                this.listener.recordUpdated(id, i);
                break;
            }
        }
    }

    onRecordCreated(id: any, notifySubscriber: boolean) {

        this.refreshIds();

        if (!notifySubscriber) {
            return;
        }

        for (var i = 0; i < this.recordIds.length; i++) {
            if (this.recordIds[i] === id) {
                this.listener.recordCreated(id, i);
                break;
            }
        }
    }
}


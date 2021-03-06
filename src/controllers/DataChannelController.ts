class DataChannelController implements IDataChannelListener {

    private scope: RecordListDirectiveScope;
    private records: IRecord[];
    private loadedRecords: {[key: number]: boolean};
    private pageConfiguration: PageConfiguration;
    private manualRefresh: boolean;
    private moduleConfiguration: IRecordListConfiguration;
    private channel: IDataChannel;

    constructor(scope: RecordListDirectiveScope, pageConfiguration: PageConfiguration, moduleConfiguration: IRecordListConfiguration) {

        this.scope = scope;
        this.records = [];
        this.loadedRecords = {};
        this.pageConfiguration = pageConfiguration;
        this.moduleConfiguration = moduleConfiguration;
        this.manualRefresh = false;

        this.subscribeToChannel();
    }

    public writeRecords(records: IRecord[]): ng.IPromise<void> {
        return this.channel.writeRecords(records);
    }

    public subscribeToChannel() {
        this.channel = this.scope.channel.subscribe(this);

        this.scope.$on('$destroy', () => {
            this.scope.channel.unsubscribe(this.channel);
        });
    }

    public getRecordCount() {
        return this.records ? this.records.length : 0;
    }

    private onRecordIdsReceived(recordIds: number[]) {
        this.scope.hasNewRecords = false;

        var savedRecords: {[key: number]: IRecord} = {};

        this.records.forEach((record: IRecord) => {
            if (this.loadedRecords[record.id]) {
                savedRecords[record.id] = record;
            }
        });

        this.records = [];
        this.loadedRecords = {};

        recordIds.forEach((recordId: number) => {
            var record: IRecord;

            if (savedRecords.hasOwnProperty(recordId.toString())) {
                record = savedRecords[recordId];
                this.loadedRecords[recordId] = true;
            } else {
                record = this.createNewRecord(recordId);
            }
            this.records.push(record);
        });

        this.pageConfiguration.setRecordCount(this.records.length);

        this.loadVisibleRecords();
    }

    public refreshNewRecords() {
        this.channel.readIds().then((recordIds: any[]) => {
            this.onRecordIdsReceived(recordIds);
        });
    }

    recordCreated(id: number, position: number) {
        if (this.manualRefresh) {
            this.scope.hasNewRecords = true;
        }

        this.pageConfiguration.setRecordCount(this.records.length);
        this.refreshNewRecords();
    }

    recordRemoved(id: number) {

        var hasChanges: boolean = false;

        for (var j = 0; j < this.records.length; j++) {
            var record = this.records[j];
            if (record.id === id) {
                this.records.splice(j, 1);
                hasChanges = this.pageConfiguration.isRecordBeforePageEnd(j);
                break;
            }
        }

        this.pageConfiguration.setRecordCount(this.records.length);

        if (hasChanges) {
            this.loadVisibleRecords();
        }
    }

    recordUpdated(id: number) {
        for (var j = 0; j < this.records.length; j++) {
            var record = this.records[j];
            if (record.id === id) {
                if (this.pageConfiguration.isRecordVisible(j)) {
                    this.updateVisibleRecords([id], this.scope.currentPage);
                } else {
                    this.records[j] = this.createNewRecord(id);
                    this.loadedRecords[id] = false;
                }
                break;
            }
        }
    }

    onModelLoaded(definition: ModelDefinition) {
        this.manualRefresh = definition.manualRefresh;
    }

    getRecordById(recordId: number): IRecord {
        for (var index = 0; index < this.records.length; index++) {
            var record = this.records[index];
            if (record.id === recordId) {
                return record;
            }
        }
        return null;
    }

    private resetRecords(recordIds: number[]) {

        this.records = [];
        this.loadedRecords = {};

        for (var i = 0; i < recordIds.length; i++) {
            var recordId = recordIds[i];
            var record = this.createNewRecord(recordId);
            this.records.push(record);
        }

        this.pageConfiguration.setRecordCount(this.records.length);
    }

    private createNewRecord(recordId: number): Row {
        var record: Row = new Row();

        this.scope.columns.forEach((column: ColumnDefinition) => {
            record[column.property] = "";
        });

        record.id = recordId;
        return record;
    }

    sort(field: string, direction: string) {
        var unloadedRecords = 0;

        for (var i = 0; i < this.records.length; i++) {
            var record = this.records[i];
            if (!this.loadedRecords[record.id]) {
                unloadedRecords++;
            }
        }

        if (unloadedRecords !== 0) {
            this.channel.sortByAndReadIds(field, direction === "down")
                .then((recordIds: number[]) => {
                    this.resetRecords(recordIds);
                }, (message: string) => {
                    if (this.moduleConfiguration.errorHandler) {
                        this.moduleConfiguration.errorHandler(message);
                    }
                });
            return;
        }

        this.records.sort((a, b) => {
            var af = a[field];
            var bf = b[field];
            if (af === bf) {
                return 0;
            }
            if (af < bf) {
                return -1;
            }
            return 1;
        });
    }

    private updateRecords(updated: IRecord[]) {
        for (var i = 0; i < updated.length; i++) {
            var source = updated[i];
            var recordId = source.id;

            var target = DataChannelController.createRecordCopy(source);

            for (var j = 0; j < this.records.length; j++) {
                var currentRecord = this.records[j];
                if (currentRecord.id !== recordId) {
                    continue;
                }

                this.records[j] = target;
                this.loadedRecords[target.id] = true;

                break;
            }
        }
    }

    private loadVisibleRecords() {
        this.showPage(this.scope.currentPage);
    }

    private static createRecordCopy(record: IRecord): IRecord {
        return record;
    }

    showPage(page) {

        if (this.scope.updating) {
            return;
        }

        var rows: Row[] = [];
        var rowIds: number[] = [];

        this.pageConfiguration.setCurrentPage(page);

        var visibleRecords = this.pageConfiguration.getVisibleRecords(this.records);

        visibleRecords.forEach((record: Row) => {
            if (!this.loadedRecords[record.id]) {
                rowIds.push(record.id);
            }
        });

        if (rowIds.length > 0) {
            this.scope.updating = true;
            this.updateVisibleRecords(rowIds, page);
            return;
        }

        this.scope.currentPage = page;

        visibleRecords.forEach((record: IRecord) => {
            var row = {
                id: record.id,
                showOptions: false,
                record: record
            };
            rows.push(row);
        });

        this.scope.showPagination = this.pageConfiguration.hasPagination();

        this.scope.rows = rows;
        this.scope.pageLoaded = true;
    }

    private updateVisibleRecords(recordIds, page) {

        this.channel.readRecords(recordIds)
            .then((data: any) => {
                this.scope.updating = false;
                this.updateRecords(data);
                this.showPage(page);
            }, (message) => {
                if (this.moduleConfiguration.errorHandler) {
                    this.moduleConfiguration.errorHandler(message);
                }
                this.scope.updating = false;
            });
    }
}
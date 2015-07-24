class DataChannelController implements IDataChannelListener {

    private scope: RecordListDirectiveScope;
    private records: Record[];
    private pageConfiguration: PageConfiguration;
    private manualRefresh: boolean;
    private moduleConfiguration: ModuleConfiguration;

    constructor(scope: RecordListDirectiveScope, pageConfiguration: PageConfiguration, moduleConfiguration: ModuleConfiguration) {

        this.scope = scope;
        this.records = [];
        this.pageConfiguration = pageConfiguration;
        this.moduleConfiguration = moduleConfiguration;
        this.manualRefresh = false;

        this.subscribeToChannel();
    }

    public subscribeToChannel() {
        var token = this.scope.channel.subscribe(this);

        this.scope.$on('$destroy', () => {
            this.scope.channel.unsubscribe(token);
        });
    }

    private onRecordIdsReceived(recordIds: number[]) {
        this.scope.hasNewRecords = false;

        var savedRecords: {[key: number]: Record} = {};

        this.records.forEach((record: Record) => {
            if (record.loaded) {
                savedRecords[record.id] = record;
            }
        });

        this.records = [];

        recordIds.forEach((recordId: number) => {
            var record: Record;

            if (savedRecords.hasOwnProperty(recordId.toString())) {
                record = savedRecords[recordId];
            } else {
                record = this.createNewRecord(recordId);
            }
            this.records.push(record);
        });

        this.loadVisibleRecords();
    }

    public refreshNewRecords() {
        this.scope.channel.readIds().then((recordIds: any[]) => {
            this.onRecordIdsReceived(recordIds);
        });
    }

    recordCreated(id: number, position: number) {
        if (this.manualRefresh) {
            this.scope.hasNewRecords = true;
        }

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
                }
                break;
            }
        }
    }

    onModelLoaded(definition: ModelDefinition) {
        this.manualRefresh = definition.manualRefresh;
    }

    getRecordById(recordId: number): Record {
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

        for (var i = 0; i < recordIds.length; i++) {
            var recordId = recordIds[i];
            var record = this.createNewRecord(recordId);
            this.records.push(record);
        }
    }

    private createNewRecord(recordId: number): Record {
        var record: Record = new Record();
        record.loaded = false;

        this.scope.columns.forEach((column: ColumnDefinition) => {
            record[column.name] = "";
        });

        record.id = recordId;
        return record;
    }

    sort(field: string, direction: string) {
        var unloadedRecords = 0;

        for (var i = 0; i < this.records.length; i++) {
            var record = this.records[i];
            if (!record.loaded) {
                unloadedRecords++;
            }
        }

        if (unloadedRecords !== 0) {
            this.scope.channel.readIdsSortedBy(field, direction)
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

    private updateRecords(updated: Record[]) {
        for (var i = 0; i < updated.length; i++) {
            var source = updated[i];
            var recordId = source.id;
            var target = DataChannelController.createRecordCopy(source);

            for (var j = 0; j < this.records.length; j++) {
                var currentRecord = this.records[j];
                var currentRecordId = currentRecord.id;
                if (currentRecordId !== recordId) {
                    continue;
                }

                this.records[j] = target;

                for (var k = 0; k < this.scope.rows.length; k++) {
                    var row = this.scope.rows[k];
                    if (row.id === recordId) {
                        this.scope.rows[k] = target;
                        target.isOdd = (k % 2) !== 0;
                        break;
                    }
                }

                break;
            }
        }
    }

    private loadVisibleRecords() {
        this.showPage(this.scope.currentPage);
    }

    private static createRecordCopy(record: Record): Record {
        record.loaded = true;
        return record;
    }

    showPage(page) {

        if (this.scope.updating) {
            return;
        }

        var rows: Record[] = [];

        this.pageConfiguration.setCurrentPage(page);

        var visibleRecords = this.pageConfiguration.getVisibleRecords(this.records);

        visibleRecords.forEach(function(record: Record) {
            if (!record.loaded) {
                rows.push(record);
            }
        });

        if (rows.length > 0) {
            this.scope.updating = true;
            this.updateVisibleRecords(rows, page);
            return;
        }

        this.scope.currentPage = page;
        this.scope.showOptions = false;

        visibleRecords.forEach(function(record: Record) {
            rows.push(record);
            record.isOdd = (rows.length % 2) !== 0;
        });

        this.scope.showPagination = this.pageConfiguration.hasPagination();

        this.scope.rows = rows;
        this.scope.pageLoaded = true;
    }

    private updateVisibleRecords(recordIds, page) {

        this.scope.channel.readRecords(recordIds)
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
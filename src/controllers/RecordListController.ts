/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file RecordListController.ts
 * @author Oleg Gordeev
 */

class RecordListController implements IDataChannelListener {

    private dataDefinition: ModelDefinition;
    private configuration: ModuleConfiguration;
    private scope: RecordListScope;
    private records: Record[];
    private currentRecordId: number;
    private currentRecord: Record;
    private qService: ng.IQService;
    private httpService: ng.IHttpService;
    private pageSize: number;
    private directiveScope: RecordListDirectiveScope;
    private pageOffset: number;
    private totalItems: number;
    private itemsPerPage: number;
    private filter: any;
    private inputForm: IWebFormsService;

    // moved from scope
    optionsTemplate: string;
    links: LinkDefinition[];
    configuration: ModelDefinition;
    modelId: string;
    // end of moved from scope

    constructor(
        scope:RecordListDirectiveScope,
        configuration: ModuleConfiguration,
        inputForm: IWebFormsService,
        httpService: ng.IHttpService,
        qService: ng.IQService) {

        this.inputForm = inputForm;
        this.directiveScope = scope;
        this.scope = <RecordListScope> scope.$new();
        this.httpService = httpService;
        this.configuration = configuration;
        this.qService = qService;
        this.pageSize = configuration.pageSize;
        this.modelId = scope.modelId;

        if (this.pageSize <= 0) {
            this.pageSize = 10;
        }

        this.dataDefinition = null;
        this.links = this.dataDefinition.links;
        this.optionsTemplate = this.dataDefinition.optionsTemplate;

        this.scope.tableColumns = 0;
        this.scope.actions = [];
        this.scope.showOptions = false;
        this.scope.columns = this.dataDefinition.columns;
        this.scope.currentPage = 0;
        this.scope.showPagination = false;
        this.scope.paginationItems = 7;
        this.scope.rows = [];
        this.scope.pageLoaded = false;
        this.scope.toolbarButtons = [];
        this.scope.hasNewRecords = false;
        this.scope.updating = false;
        this.scope.hasRecordSearch = this.dataDefinition.hasSearch;
        this.scope.recordSearchVisible = false;
        this.scope.recordSearchText = "";

        this.records = [];
        this.currentRecordId = null;
        this.currentRecord = null;

        this.scope.searchRecords = () => this.onSearchRecords();
        this.scope.toggleRecordSearch = () => this.toggleRecordSearch();

        var token = scope.channel.subscribe(this);

        scope.$on('$destroy', () => {
            scope.channel.unsubscribe(token);
        });

        this.scope.refreshNewRecords = () => this.refreshNewRecords();

        this.initializeColumnScopes();
        this.initializeActions();

        this.scope.hasOptionsBar = this.scope.columns.length > 0 && (this.scope.actions.length > 0 || this.links.length > 0);

        if (this.scope.hasOptionsBar) {
            this.scope.columns[0].colSpan = 2;
        }

        this.scope.onToolbarButtonClick = (action: Action) => this.onToolbarButtonClick(action);

        this.scope.onClickOptions = (record: Record, column: ColumnDefinition, event) => this.onClickOptions(record, column, event);

        this.scope.isActionVisible = (action: Action) => {
            if (this.currentRecord === null || !this.scope.showOptions) {
                return false;
            }
            return action.visibleFunction(this.currentRecord);
        };

        this.scope.sortColumn = (column: ColumnDefinition) => this.sortColumn(column);

        this.scope.navigateToLink = (link) => {
            this.configuration.navigate(link);
        };

        this.scope.getColumnLink = (column, row) => RecordListController.extractLink(column.url, row);

        this.scope.executeAction = (action: Action) => this.executeAction(action);

        this.initializeColumns();
        this.loadModel();
    }

    recordRemoved(id: number) {

        var hasChanges: boolean = false;

        for (var j = 0; j < this.records.length; j++) {
            var record = this.records[j];
            if (record.id === id) {
                this.records.splice(j, 1);
                if (this.pageSize > 0) {
                    hasChanges = j < this.pageOffset + this.pageSize;
                }
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
                if (this.pageSize > 0 && j >= this.pageOffset && j < this.pageOffset + this.pageSize) {
                    this.updateVisibleRecords([id], this.scope.currentPage);
                } else {
                    this.records[j] = this.createNewRecord(id);
                }
                break;
            }
        }
    }

    recordCreated(id: number, position: number) {
        if (this.dataDefinition.manualRefresh) {
            this.scope.hasNewRecords = true;
        }

        this.scope.refreshNewRecords();
    }

    private loadModel() {
        this.httpService.get<ModelDefinition>(this.modelId + '.json', { cache: true })
            .then(data => {
                this.onModelLoaded(data.data);
            }, (message) => this.onModelLoadError() );

    }

    private onModelLoaded(definition: ModelDefinition) {
        this.dataDefinition = definition;
        if (this.dataDefinition.extensionScript && this.dataDefinition.extensionScript.length) {
            require([this.dataDefinition.extensionScript], (extensionScript: (scope: RecordListScope) => void) => {
                extensionScript(this.scope);
                this.initializeRecords();
                this.showPage(this.directiveScope.currentPage || "1");
            });
        } else {
            this.initializeRecords();
            this.showPage(this.directiveScope.currentPage || "1");
        }
    }

    private onModelLoadError() {

    }

    private onToolbarButtonClick(action: Action) {
        if (this.scope.updating) {
            return;
        }

        this.directiveScope.handleAction(action.name, null).then((record) => {
            this.inputForm.editObject(record, action.type, (record) => {

                var deferred = this.qService.defer<void>();

                this.directiveScope.handleAction(action.name, record)
                    .then(
                    () => {
                        deferred.resolve();
                    },
                    (message: string) => deferred.reject(message) );

                return deferred.promise;
            });
        });
    }

    private onSearchRecords() {
        if (this.scope.recordSearchText.length > 0) {
            this.filter = {
                search: this.scope.recordSearchText
            };
        } else {
            this.filter = null;
        }
        this.scope.refreshNewRecords();
    }

    private initializeColumnScopes() {
        this.scope.columns.forEach((column: ColumnDefinition) => {
            column.colSpan = 1;
            if (!column.scope || !column.scope.length) {
                column.context = (obj: Record) => { return obj; };
            } else {
                column.context = <(obj: Record) => any>(new Function("obj", "with(obj) { return " + column.scope + "; }"));
            }
        });
    }

    private initializeActions() {
        this.dataDefinition.actions.forEach((action: ActionDefinition) => {

            var visibleFunction : Function;

            if (action.visible && action.visible.length > 0) {
                visibleFunction = new Function("obj", "with(obj) { return " + action.visible + "; }");
            } else {
                visibleFunction = () => { return true; };
            }

            switch (action.type) {
                case ActionType.RECORD:
                case ActionType.RECORD_CREATE:
                case ActionType.RECORD_INITIALIZE_CREATE:
                    var target = new Action();
                    target.name = action.name;
                    target.text = action.text;
                    target.visible = visibleFunction;
                    target.type = action.type;
                    target.parameter = action.parameter;
                    this.scope.actions.push(target);
                    break;
                case ActionType.CREATE:
                    var target = new Action();
                    target.name = action.name;
                    target.text = action.text;
                    target.visible = visibleFunction;
                    target.type = action.parameter;
                    this.scope.toolbarButtons.push(target);
                    break;
            }
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

    private refreshNewRecords() {
        this.directiveScope.channel.readIds().then((recordIds: any[]) => {
            this.onRecordIdsReceived(recordIds);
        });
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

    private static createRecordCopy(record: Record): Record {
        record.loaded = true;
        return record;
    }

    private toggleRecordSearch() {
        this.scope.recordSearchVisible = !this.scope.recordSearchVisible;

        if (!this.scope.recordSearchVisible) {
            if (this.scope.recordSearchText.length > 0) {
                this.scope.recordSearchText = "";
                this.scope.searchRecords();
            }
        }
    }

    private resetRecords(recordIds: number[]) {

        this.records = [];

        for (var i = 0; i < recordIds.length; i++) {
            var recordId = recordIds[i];
            var record = this.createNewRecord(recordId);
            this.records.push(record);
        }
    }

    private hideOptions() {
        this.scope.showOptions = false;
    }

    private onClickOptions(record: Record, column: ColumnDefinition, event) {

        if (this.scope.updating) {
            return;
        }

        if (!this.scope.hasOptionsBar) {
            return;
        }

        if (event && event.target && event.target.nodeName === "A") {
            return;
        }

        if (column !== null && column.ignoreOptions) {
            return;
        }

        var recordId = record.id;

        if (!this.currentRecord || this.currentRecordId !== recordId) {
            this.scope.showOptions = true;
        } else {
            this.scope.showOptions = !this.scope.showOptions;
        }

        this.currentRecordId = recordId;
        this.currentRecord = record;

    }

    private sortColumn(column: ColumnDefinition) {

        if (!column.sortable) {
            return;
        }

        if (this.scope.updating) {
            return;
        }

        var current = column.sort;

        for (var i = 0; i < this.scope.columns.length; i++) {
            var column = this.scope.columns[i];
            column.sort = "";
        }

        if (!current || current === "up") {
            current = "down";
        } else {
            current = "up";
        }

        column.sort = current;

        var unloadedRecords = 0;

        for (var i = 0; i < this.records.length; i++) {
            var record = this.records[i];
            if (!record.loaded) {
                unloadedRecords++;
            }
        }

        this.hideOptions();

        if (unloadedRecords !== 0) {
            this.directiveScope.channel.readIdsSortedBy(column.name, current)
                .then((recordIds: number[]) => {
                    this.resetRecords(recordIds);
                    this.showPage(1);
                }, (message: string) => {
                    this.inputForm.message(message, "Error");
                });
            return;
        }

        var field = column.name;

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

        this.showPage(1);
    }

    private editCurrentRecord(index) {

        this.inputForm.editObject(this.dataDefinition.type, this.records[index], (record) => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();

            this.directiveScope.channel.writeRecords([record])
                .then(() => {
                    deferred.resolve();
                }, (message: string) => {
                    deferred.reject(message);
                });

            return deferred.promise;
        });
    }

    private executeAction(action: Action) {

        if (this.currentRecordId === null) {
            return;
        }

        var index;

        for (index = 0; index < this.records.length; index++) {
            var itemId = this.records[index].id;
            if (itemId === this.currentRecordId) {
                break;
            }
        }

        if (index >= this.records.length) {
            return;
        }

        if (action.name === "modifyRecord") {
            this.editCurrentRecord(index);
            return;
        }

        var actionData: IRecord = <any>{};
        actionData.id = this.currentRecordId;

        var sendCommand = ():ng.IPromise<void> => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();
            this.directiveScope.handleAction(action.name, actionData)
                .then(() => {
                    deferred.resolve();
                });
            return deferred.promise;
        };

        if (action.type === ActionType.RECORD_INITIALIZE_CREATE) {
            this.directiveScope.handleAction(action.name, actionData)
                .then((data: any) => {
                    this.inputForm.editObject(data, action.parameter, (object) => {
                        actionData = object;
                        return sendCommand();
                    });
                }, (message: string) => {
                    this.inputForm.message(message, "Error");
                });
        } else if (action.type === ActionType.RECORD_CREATE) {
            this.inputForm.editObject(null, action.parameter, () => {
                return sendCommand();
            });
        } else {
            sendCommand().catch((message: string) => {
                this.inputForm.message(message, "Error");
            });
        }
    }

    private static extractLink(text: string, row: Record) {
        var link = text;
        var offset = 0;
        while (true) {
            var pos = link.indexOf("{", offset);
            if (pos < 0) {
                break;
            }
            var end = link.indexOf("}", pos);
            if (end < 0) {
                break;
            }

            var parameter = link.substring(pos + 1, end);

            if (!row.hasOwnProperty(parameter)) {
                offset = pos + 1;
                continue;
            }

            parameter = row[parameter];
            link = link.substring(0, pos) + parameter + link.substring(end + 1);
            offset += parameter.length;
        }
        return link;
    }

    private initializeColumns() {

        for (var i = 0; i < this.scope.columns.length; i++) {
            var column = this.scope.columns[i];
            this.scope.tableColumns += column.colSpan;
            if (!column.headerClass) {
                column.headerClass = "";
            }
            if (!column.cellClass) {
                column.cellClass = "grid-data";
            } else {
                column.cellClass += " grid-data";
            }

            switch (column.align) {
                case "Left":
                    column.cellClass += " grid-left";
                    column.headerClass += " grid-left";
                    break;
                case "Center":
                    column.cellClass += " grid-center";
                    column.headerClass += " grid-center";
                    break;
                case "Right":
                    column.cellClass += " grid-right";
                    column.headerClass += " grid-right";
                    break;
            }

            if (column.ignoreOptions) {
                column.cellClass += " ignore-options";
            }

            if (!column.template || column.template.length === 0) {
                var value = "data." + column.name;
                var bind = "ng-bind";
                if (column.allowUnsafe) {
                    value = "getSafeValue(" + value + ")";
                    bind = "ng-bind-html";
                }

                if (column.url && column.url.length > 0) {
                    column.template = "<a href=\"{{getColumnLink(column, row)}}\" ng-click=\"navigateToView(getColumnLink(column, row))\" " + bind + "=\"" + value + "\"></a>";
                } else {
                    column.template = "<span " + bind + "=\"" + value + "\"></span>";
                }
            }
        }

        this.resetRecords(this.dataDefinition.recordIds);

        this.scope.$watch("currentPageNumeric", () => {
            if (!this.scope.pageLoaded) {
                return;
            }

            var itemsPerPage = this.pageSize;
            var pageCount = ((this.totalItems + itemsPerPage - 1) / itemsPerPage) | 0;

            if (this.directiveScope.currentPage !== "last" || this.scope.currentPage !== pageCount) {
                this.directiveScope.currentPage = this.scope.currentPage.toString();
            }
        });

        this.loadVisibleRecords();
    }

    private updateVisibleRecords(recordIds, page) {

        this.directiveScope.channel.readRecords(recordIds)
            .then((data: any) => {
                this.scope.updating = false;
                this.updateRecords(data);
                this.showPage(page);
        }, (message) => {
            this.inputForm.message(message, "Error");
            this.scope.updating = false;
        });
    }

    private showPage(page) {

        if (this.scope.updating) {
            return;
        }

        this.totalItems = this.records.length;
        var itemsPerPage = this.configuration.pageSize;
        var pageCount = ((this.totalItems + itemsPerPage - 1) / itemsPerPage) | 0;

        var localPage = page;

        if (localPage === "last") {
            localPage = pageCount;
        }

        if (localPage < 1) {
            localPage = 1;
        } else if (localPage > pageCount) {
            localPage = pageCount > 0 ? pageCount : 1;
        }

        var pageOffset = (localPage - 1) * itemsPerPage;
        var pageSize = itemsPerPage;

        if (pageCount === 0) {
            pageSize = 0;
        } else if (pageOffset + pageSize > this.records.length) {
            pageSize = this.records.length - pageOffset;
        }

        var rows: Record[] = [];

        for (var i = 0; i < pageSize; i++) {
            var record = this.records[i + pageOffset];
            if (!record.loaded) {
                rows.push(record);
            }
        }

        if (rows.length > 0) {
            this.scope.updating = true;
            this.updateVisibleRecords(rows, page);
            return;
        }

        this.directiveScope.currentPage = page;
        this.scope.currentPage = localPage;
        this.pageOffset = pageOffset;
        this.pageSize = pageSize;
        this.itemsPerPage = itemsPerPage;

        this.currentRecordId = null;
        this.currentRecord = null;
        this.scope.showOptions = false;

        for (var i = 0; i < this.pageSize; i++) {
            var record = this.records[i + this.pageOffset];
            rows.push(record);
            record.isOdd = (i % 2) !== 0;
        }

        this.scope.showPagination = this.pageSize < this.totalItems;

        this.scope.rows = rows;
        this.scope.pageLoaded = true;
    }

    private updateRecords(updated: Record[]) {
        for (var i = 0; i < updated.length; i++) {
            var source = updated[i];
            var recordId = source.id;
            var target = RecordListController.createRecordCopy(source);

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

    private initializeRecords() {

        this.dataDefinition.records.forEach((source: Record) => {

            var recordId = source.id;

            var target: Record = null;

            for (var i = 0; i < this.records.length; i++) {
                if (this.records[i].id == recordId) {
                    target = this.records[i];
                    break;
                }
            }

            if (!target) {
                return;
            }

            var keys = Object.keys(source);

            keys.forEach((key: string) => {
                target[key] = source[key];
            });

            target.loaded = true;
        });
    }
}

recordListModule.controller('recordList', [
    '$scope',
    'moduleConfiguration',
    'inputForm',
    '$http',
    '$q',
    RecordListController
]);

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file RecordListDirective.ts
 * @author Oleg Gordeev
 */

/// <reference path="../../typings/requirejs/require.d.ts" />

interface RecordListDirectiveScope extends ng.IScope {
    model: string;
    channel: IDataChannel;
    actionHandler: (actionName: string, dataObject: any) => ng.IPromise<any>;
    pageHandler: (page?: string) => string;

    onToolbarButtonClick: (action: Action) => void;
    onRefreshNewRecords: () => void;
    onClickOptions: (record: Record, column: ColumnDefinition, event) => void;
    onSortColumn: (column: ColumnDefinition) => void;
    onNavigateToLink: (link) => void;
    isActionVisible: (action: Action) => boolean;
    onExecuteAction: (action: Action) => void;
    linkUrl: (link: LinkDefinition) => string;
    getColumnLink: (column, row) => string;
    onSearchRecords: () => void;
    onToggleRecordSearch: () => void;

    currentPage: number;
    pageCount: number;
    tableColumns: number;
    actions: Action[];
    links: LinkDefinition[];
    columns: ColumnDefinition[];
    hasOptionsBar: boolean;
    showOptions: boolean;
    rows: Record[];
    showPagination: boolean;
    paginationItems: number;
    pageLoaded: boolean;
    updating: boolean;
    toolbarButtons: any[];
    hasNewRecords: boolean;
    hasRecordSearch: boolean;
    recordSearchVisible: boolean;
    recordSearchText: string;
}

class RecordListDirectiveLink {

    private dataDefinition: ModelDefinition;
    private configuration: ModuleConfiguration;
    private scope: RecordListDirectiveScope;
    private currentRecordId: number;
    private currentRecord: Record;
    private qService: ng.IQService;
    private httpService: ng.IHttpService;
    private filter: any;
    private dataChannelController: DataChannelController;
    private pageConfiguration: PageConfiguration;
    private modelId: string;

    constructor(
        scope:RecordListDirectiveScope,
        configuration: ModuleConfiguration,
        httpService: ng.IHttpService,
        qService: ng.IQService) {

        this.scope = scope;
        this.httpService = httpService;
        this.configuration = configuration;
        this.qService = qService;
        this.modelId = scope.model;

        this.dataDefinition = null;
        this.pageConfiguration = new PageConfiguration(configuration);
        this.dataChannelController = new DataChannelController(scope, this.pageConfiguration, this.configuration);

        var configurator = new ScopeConfiguration(scope);

        this.setScopeEvents();

        this.currentRecordId = null;
        this.currentRecord = null;

        this.dataChannelController.subscribeToChannel();

        if (this.scope.hasOptionsBar) {
            this.scope.columns[0].colSpan = 2;
        }

        this.loadModel(configurator);
    }

    private setScopeEvents() {
        this.scope.onSearchRecords = () => this.onSearchRecords();
        this.scope.onToggleRecordSearch = () => this.toggleRecordSearch();
        this.scope.onRefreshNewRecords = () => this.dataChannelController.refreshNewRecords();
        this.scope.onToolbarButtonClick = (action: Action) => this.onToolbarButtonClick(action);
        this.scope.onClickOptions = (record: Record, column: ColumnDefinition, event) => this.onClickOptions(record, column, event);
        this.scope.isActionVisible = (action: Action) => this.isActionVisible(action);
        this.scope.onSortColumn = (column: ColumnDefinition) => this.sortColumn(column);
        this.scope.getColumnLink = (column, row) => RecordListDirectiveLink.extractLink(column.url, row);
        this.scope.onExecuteAction = (action: Action) => this.executeAction(action);
        this.scope.onNavigateToLink = (link) => this.configuration.navigate(link);
    }

    private isActionVisible(action: Action) {
        if (this.currentRecord === null || !this.scope.showOptions) {
            return false;
        }
        return action.visibleFunction(this.currentRecord);
    }

    private loadModel(configurator: ScopeConfiguration) {
        this.httpService.get<ModelDefinition>(this.modelId + '.json', { cache: true })
            .then(data => {
                this.onModelLoaded(data.data, configurator);
            }, (message: string) => {
                if (this.configuration.errorHandler) {
                    this.configuration.errorHandler(message);
                }
            } );

    }

    private onModelLoaded(definition: ModelDefinition, configurator: ScopeConfiguration) {
        this.dataDefinition = definition;
        if (this.dataDefinition.extensionScript && this.dataDefinition.extensionScript.length) {
            require([this.dataDefinition.extensionScript], (extensionScript: (scope: RecordListDirectiveScope) => void) => {
                extensionScript(this.scope);
                this.onModelAndExtensionsLoaded(definition, configurator);
            });
        } else {
            this.onModelAndExtensionsLoaded(definition, configurator);
        }
    }

    private onModelAndExtensionsLoaded(definition: ModelDefinition, configurator: ScopeConfiguration) {

        configurator.onDataDefinitionLoaded(definition);
        this.dataChannelController.onModelLoaded(definition);
        this.dataChannelController.refreshNewRecords();
    }

    private onToolbarButtonClick(action: Action) {
        if (this.scope.updating) {
            return;
        }

        this.scope.actionHandler(action.name, null).then((record) => {
            this.configuration.editRecord(record, (record) => {

                var deferred = this.qService.defer<void>();

                this.scope.actionHandler(action.name, record)
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

        this.dataChannelController.refreshNewRecords();
    }

    private toggleRecordSearch() {
        this.scope.recordSearchVisible = !this.scope.recordSearchVisible;

        if (!this.scope.recordSearchVisible) {
            if (this.scope.recordSearchText.length > 0) {
                this.scope.recordSearchText = "";
                this.onSearchRecords();
            }
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

        this.hideOptions();

        var field = column.name;

        this.dataChannelController.sort(field, current);
        this.dataChannelController.showPage(1);
    }

    private editCurrentRecord(record) {

        this.configuration.editRecord(record, (record) => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();

            this.scope.channel.writeRecords([record])
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

        if (action.name === "modifyRecord") {

            var record = this.dataChannelController.getRecordById(this.currentRecordId);

            if (!record) {
                return;
            }

            this.editCurrentRecord(record);
            return;
        }

        var actionData: IRecord = <any>{};
        actionData.id = this.currentRecordId;

        var sendCommand = ():ng.IPromise<void> => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();
            this.scope.actionHandler(action.name, actionData)
                .then(() => {
                    deferred.resolve();
                });
            return deferred.promise;
        };

        if (action.type === ActionType.RECORD_INITIALIZE_CREATE) {
            this.scope.actionHandler(action.name, actionData)
                .then((data: any) => {
                    this.configuration.editRecord(data, (object: IRecord) => {
                        actionData = object;
                        return sendCommand();
                    });
                }, (message: string) => {
                    if (this.configuration.errorHandler) {
                        this.configuration.errorHandler(message);
                    }
                });
        } else if (action.type === ActionType.RECORD_CREATE) {
            this.configuration.editRecord(null, () => {
                return sendCommand();
            });
        } else {
            sendCommand().catch((message: string) => {
                if (this.configuration.errorHandler) {
                    this.configuration.errorHandler(message);
                }
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
}

recordListModule.directive("recordList", ['moduleConfiguration', '$http', '$q',
    (configuration: ModuleConfiguration, httpService: ng.IHttpService, qService: ng.IQService) => {
    return {
        restrict: 'EA',
        template: templates['views/recordList.jade'],
        scope: {
            model: '=',
            channel: '=',
            actionHandler: '=',
            pageHandler: '='
        },
        link: (scope: RecordListDirectiveScope) => {
            return new RecordListDirectiveLink(scope, configuration, httpService, qService);
        }
    }
}]);
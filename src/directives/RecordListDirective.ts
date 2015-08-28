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

class RecordListDirectiveLink {

    private dataDefinition: ModelDefinition;
    private configuration: IRecordListConfiguration;
    private scope: RecordListDirectiveScope;
    private qService: ng.IQService;
    private httpService: ng.IHttpService;
    private filter: any;
    private dataChannelController: DataChannelController;
    private pageConfiguration: PageConfiguration;
    private modelId: string;

    constructor(
        scope:RecordListDirectiveScope,
        configuration: IRecordListConfiguration,
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
        this.scope.onClickOptions = (record: Record, event) => this.onClickOptions(record, event);
        this.scope.isActionVisible = (action: Action, record: Record) => this.isActionVisible(action, record);
        this.scope.onSortColumn = (column: ColumnDefinition) => this.sortColumn(column);
        this.scope.getColumnLink = (column, row) => RecordListDirectiveLink.extractLink(column.url, row);
        this.scope.onExecuteAction = (action: Action, record: Record) => this.executeAction(action, record);
        this.scope.onNavigateToLink = (link) => this.configuration.navigate(link);
    }

    private isActionVisible(action: Action, record: Record) {
        if (!this.scope.hasOptionsBar) {
            return false;
        }
        return !action.visibleFunction || action.visibleFunction(record);
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
        if (this.scope.updating || !this.scope.actionHandler) {
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
        for (var i = 0; i < this.scope.rows.length; i++) {
            this.scope.rows[i].showOptions = false;
        }
    }

    private onClickOptions(record: Record, event) {

        if (this.scope.updating) {
            return;
        }

        if (!this.scope.hasOptionsBar) {
            return;
        }

        if (event && event.target && event.target.nodeName === "A") {
            return;
        }

        if (!record.showOptions) {
            this.hideOptions();
            record.showOptions = true;

        } else {
            record.showOptions = false;
        }
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

        var field = column.property;

        this.dataChannelController.sort(field, current);
        this.dataChannelController.showPage(1);
    }

    private editCurrentRecord(record) {

        this.configuration.editRecord(record, (record) => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();

            this.dataChannelController.writeRecords([record])
                .then(() => {
                    deferred.resolve();
                }, (message: string) => {
                    deferred.reject(message);
                });

            return deferred.promise;
        });
    }

    private executeAction(action: Action, record: Record) {

        if (action.name === "modifyRecord") {

            var recordToEdit = this.dataChannelController.getRecordById(record.id);

            if (!recordToEdit) {
                return;
            }

            this.editCurrentRecord(recordToEdit);
            return;
        }

        var actionData: IRecord = <any>{};
        actionData.id = record.id;

        var sendCommand = ():ng.IPromise<void> => {
            var deferred: ng.IDeferred<void> = this.qService.defer<void>();
            if (this.scope.actionHandler) {
                this.scope.actionHandler(action.name, actionData)
                    .then(() => {
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }
            return deferred.promise;
        };

        if (action.type === ActionType.RECORD_INITIALIZE_CREATE) {
            if (this.scope.actionHandler) {
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
            }
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

recordListModule.directive("recordList", ['recordListConfiguration', '$http', '$q',
    (configuration: IRecordListConfiguration, httpService: ng.IHttpService, qService: ng.IQService) => {
    return {
        restrict: 'EA',
        template: templates['views/recordList.jade'],
        scope: {
            model: '@',
            channel: '=',
            actionHandler: '=',
            pageHandler: '='
        },
        link: (scope: RecordListDirectiveScope) => {
            return new RecordListDirectiveLink(scope, configuration, httpService, qService);
        }
    }
}]);

(function() { function ___f$(angular) {/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file RecordListModule.ts
 * @author Oleg Gordeev
 */
var recordListModule = angular.module('lm-recordlist', [
    'ngMaterial',
    'ngTouch',
    'ngMessages',
    'ngAnimate',
    'pascalprecht.translate'
]);
var templates = {
    "views/optionsBar.jade": "<tr ng-show=\"showOptions\" class=\"options-panel\"><td colspan=\"{{columns.length+1}}\"><md-button ng-disabled=\"!isActionVisible(action)\" ng-repeat=\"action in actions\" ng-bind=\"action.text | translate\" ng-click=\"executeAction(action)\" aria-label=\"action.text | translate\" class=\"md-primary md-raised\"></md-button><span ng-repeat=\"link in links\"><node-link ng-if=\"!link.external\" path=\"{{linkUrl(link)}}\" ng-bind=\"link.text | translate\" class=\"btn btn-info\"></node-link><a ng-if=\"link.external\" href=\"{{linkUrl(link)}}\" ng-bind=\"link.text | translate\" class=\"btn btn-info\"></a></span></td></tr>",
    "views/paging.jade": "",
    "views/recordList.jade": "<div layout=\"row\"><div ng-if=\"toolbarButtons.length &gt; 0\" class=\"grid-control-panel-top\"><md-button ng-repeat=\"button in toolbarButtons\" aria-label=\"button.text | translate\" ng-click=\"onToolbarButtonClick(button)\" ng-bind=\"button.text | translate\" class=\"md-default md-raised\"></md-button></div><div ng-if=\"manualRefresh\" class=\"recordlist-refresh-panel\"><md-button ng-click=\"refreshNewRecords()\" ng-show=\"hasNewRecords\" class=\"md-primary\">{{ 'Main.GetNewRecords' | translate }}</md-button></div><pagination ng-show=\"showPagination\" items-per-page=\"itemsPerPage\" boundary-links=\"true\" direction-links=\"true\" total-items=\"totalItems\" ng-model=\"currentPageNumeric\" previous-text=\"&amp;lsaquo;\" next-text=\"&amp;rsaquo;\" first-text=\"&amp;laquo;\" last-text=\"&amp;raquo;\" max-size=\"paginationItems\" ng-class=\"{ 'grid-refreshing' : updating }\" class=\"pagination-sm pagination-top\"></pagination><table ng-class=\"{ 'show-options' : showOptions, 'has-options' : hasOptionsBar, 'grid-refreshing' : updating }\" class=\"grid-control\"><tr><th ng-repeat=\"column in columns\" width=\"{{column.width}}\" colspan=\"{{column.colSpan}}\" class=\"{{column.headerClass}}\"><span ng-click=\"sortColumn(column)\" ng-bind=\"column.text | translate\" ng-class=\"{ 'sort-up' : column.sort == 'up', 'sort-down' : column.sort == 'down' }\"></span><span ng-if=\"hasRecordSearch &amp;&amp; column == columns[columns.length-1]\" class=\"toggle-search-button\"><ng-button ng-click=\"toggleRecordSearch()\"><span ng-class=\"{ 'glyphicon-chevron-up' : recordSearchVisible, 'glyphicon-search' : !recordSearchVisible }\" class=\"glyphicon\"></span></ng-button></span></th></tr><tr ng-if=\"hasRecordSearch\" ng-show=\"recordSearchVisible\" class=\"search-row\"><td colspan=\"{{(tableColumns)}}\"><form ui-keypress=\"{ 13: searchRecords() }\"><table><tr><td><input type=\"text\" placeholder=\"Enter text to search\" ng-model=\"getRecordListScope().recordSearchText\" class=\"form-control\"/></td><td><ng-button ng-click=\"searchRecords()\"><span class=\"glyphicon glyphicon-search\"></span></ng-button></td></tr></table></form></td></tr><tr ng-repeat=\"row in rows\" ng-class=\"{ 'odd': row.isOdd }\"><td ng-if=\"hasOptionsBar\" ng-class=\"columns[0].cellClass\" cell-show-options=\"\" ng-click=\"onClickOptions(row, null, $event)\" class=\"grid-cell-options\"><span></span></td><td ng-repeat=\"column in columns\" bind-cell=\"column\" row=\"row\" ng-class=\"column.cellClass\" cell-show-options=\"\" ng-click=\"onClickOptions(row, column, $event)\"></td></tr></table><pagination ng-show=\"showPagination\" items-per-page=\"itemsPerPage\" boundary-links=\"true\" direction-links=\"true\" total-items=\"totalItems\" ng-model=\"currentPageNumeric\" previous-text=\"&amp;lsaquo;\" next-text=\"&amp;rsaquo;\" first-text=\"&amp;laquo;\" last-text=\"&amp;raquo;\" max-size=\"paginationItems\" ng-class=\"{ 'grid-refreshing' : updating }\" class=\"pagination-sm\"></pagination><div ng-if=\"toolbarButtons.length &gt; 0\" class=\"grid-control-panel-bottom\"><md-button ng-repeat=\"button in toolbarButtons\" aria-label=\"button.text | translate\" ng-click=\"onToolbarButtonClick(button)\" ng-bind=\"button.text | translate\" class=\"md-default md-raised\"></md-button></div></div>",
    "views/toolBar.jade": ""
};
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file Action.ts
 * @author Oleg Gordeev
 */
var Action = (function () {
    function Action() {
    }
    return Action;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file ActionDefinition.ts
 * @author Oleg Gordeev
 */
var ActionDefinition = (function () {
    function ActionDefinition() {
    }
    return ActionDefinition;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file ActionType.ts
 * @author Oleg Gordeev
 */
var ActionType = (function () {
    function ActionType() {
    }
    ActionType.RECORD = "RECORD";
    ActionType.RECORD_CREATE = "RECORD_CREATE";
    ActionType.RECORD_INITIALIZE_CREATE = "RECORD_INITIALIZE_CREATE";
    ActionType.CREATE = "CREATE";
    return ActionType;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file ColumnDefinition.ts
 * @author Oleg Gordeev
 */
var ColumnDefinition = (function () {
    function ColumnDefinition() {
    }
    return ColumnDefinition;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file LinkDefinition.ts
 * @author Oleg Gordeev
 */
var LinkDefinition = (function () {
    function LinkDefinition() {
    }
    return LinkDefinition;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file ModuleConfiguration.ts
 * @author Oleg Gordeev
 */
var ModuleConfiguration = (function () {
    function ModuleConfiguration() {
    }
    return ModuleConfiguration;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file Record.ts
 * @author Oleg Gordeev
 */
var Record = (function () {
    function Record() {
    }
    return Record;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
var DataChannelController = (function () {
    function DataChannelController(scope, pageConfiguration, moduleConfiguration) {
        this.scope = scope;
        this.records = [];
        this.pageConfiguration = pageConfiguration;
        this.moduleConfiguration = moduleConfiguration;
        this.manualRefresh = false;
        this.subscribeToChannel();
    }
    DataChannelController.prototype.subscribeToChannel = function () {
        var _this = this;
        var token = this.scope.channel.subscribe(this);
        this.scope.$on('$destroy', function () {
            _this.scope.channel.unsubscribe(token);
        });
    };
    DataChannelController.prototype.onRecordIdsReceived = function (recordIds) {
        var _this = this;
        this.scope.hasNewRecords = false;
        var savedRecords = {};
        this.records.forEach(function (record) {
            if (record.loaded) {
                savedRecords[record.id] = record;
            }
        });
        this.records = [];
        recordIds.forEach(function (recordId) {
            var record;
            if (savedRecords.hasOwnProperty(recordId.toString())) {
                record = savedRecords[recordId];
            }
            else {
                record = _this.createNewRecord(recordId);
            }
            _this.records.push(record);
        });
        this.loadVisibleRecords();
    };
    DataChannelController.prototype.refreshNewRecords = function () {
        var _this = this;
        this.scope.channel.readIds().then(function (recordIds) {
            _this.onRecordIdsReceived(recordIds);
        });
    };
    DataChannelController.prototype.recordCreated = function (id, position) {
        if (this.manualRefresh) {
            this.scope.hasNewRecords = true;
        }
        this.refreshNewRecords();
    };
    DataChannelController.prototype.recordRemoved = function (id) {
        var hasChanges = false;
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
    };
    DataChannelController.prototype.recordUpdated = function (id) {
        for (var j = 0; j < this.records.length; j++) {
            var record = this.records[j];
            if (record.id === id) {
                if (this.pageConfiguration.isRecordVisible(j)) {
                    this.updateVisibleRecords([id], this.scope.currentPage);
                }
                else {
                    this.records[j] = this.createNewRecord(id);
                }
                break;
            }
        }
    };
    DataChannelController.prototype.onModelLoaded = function (definition) {
        this.manualRefresh = definition.manualRefresh;
    };
    DataChannelController.prototype.getRecordById = function (recordId) {
        for (var index = 0; index < this.records.length; index++) {
            var record = this.records[index];
            if (record.id === recordId) {
                return record;
            }
        }
        return null;
    };
    DataChannelController.prototype.resetRecords = function (recordIds) {
        this.records = [];
        for (var i = 0; i < recordIds.length; i++) {
            var recordId = recordIds[i];
            var record = this.createNewRecord(recordId);
            this.records.push(record);
        }
    };
    DataChannelController.prototype.createNewRecord = function (recordId) {
        var record = new Record();
        record.loaded = false;
        this.scope.columns.forEach(function (column) {
            record[column.name] = "";
        });
        record.id = recordId;
        return record;
    };
    DataChannelController.prototype.sort = function (field, direction) {
        var _this = this;
        var unloadedRecords = 0;
        for (var i = 0; i < this.records.length; i++) {
            var record = this.records[i];
            if (!record.loaded) {
                unloadedRecords++;
            }
        }
        if (unloadedRecords !== 0) {
            this.scope.channel.readIdsSortedBy(field, direction)
                .then(function (recordIds) {
                _this.resetRecords(recordIds);
            }, function (message) {
                if (_this.moduleConfiguration.errorHandler) {
                    _this.moduleConfiguration.errorHandler(message);
                }
            });
            return;
        }
        this.records.sort(function (a, b) {
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
    };
    DataChannelController.prototype.updateRecords = function (updated) {
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
    };
    DataChannelController.prototype.loadVisibleRecords = function () {
        this.showPage(this.scope.currentPage);
    };
    DataChannelController.createRecordCopy = function (record) {
        record.loaded = true;
        return record;
    };
    DataChannelController.prototype.showPage = function (page) {
        if (this.scope.updating) {
            return;
        }
        var rows = [];
        this.pageConfiguration.setCurrentPage(page);
        var visibleRecords = this.pageConfiguration.getVisibleRecords(this.records);
        visibleRecords.forEach(function (record) {
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
        visibleRecords.forEach(function (record) {
            rows.push(record);
            record.isOdd = (rows.length % 2) !== 0;
        });
        this.scope.showPagination = this.pageConfiguration.hasPagination();
        this.scope.rows = rows;
        this.scope.pageLoaded = true;
    };
    DataChannelController.prototype.updateVisibleRecords = function (recordIds, page) {
        var _this = this;
        this.scope.channel.readRecords(recordIds)
            .then(function (data) {
            _this.scope.updating = false;
            _this.updateRecords(data);
            _this.showPage(page);
        }, function (message) {
            if (_this.moduleConfiguration.errorHandler) {
                _this.moduleConfiguration.errorHandler(message);
            }
            _this.scope.updating = false;
        });
    };
    return DataChannelController;
})();
var PageConfiguration = (function () {
    function PageConfiguration(configuration) {
        this.defaultPageSize = configuration.pageSize;
        if (this.defaultPageSize <= 0) {
            this.defaultPageSize = 10;
        }
        this.setRecordCount(0);
        this.setCurrentPage(1);
    }
    PageConfiguration.prototype.isRecordBeforePageEnd = function (recordIndex) {
        if (this.pageSize > 0) {
            return recordIndex < this.pageOffset + this.pageSize;
        }
        return false;
    };
    PageConfiguration.prototype.hasPagination = function () {
        return this.pageSize < this.totalItems;
    };
    PageConfiguration.prototype.isRecordVisible = function (recordIndex) {
        return this.pageSize > 0 && recordIndex >= this.pageOffset && recordIndex < this.pageOffset + this.pageSize;
    };
    PageConfiguration.prototype.getVisibleRecords = function (allRecords) {
        var ret = [];
        var start = this.pageOffset;
        var end = start + this.pageSize;
        for (var i = start; i < end; i++) {
            ret.push(allRecords[i]);
        }
        return ret;
    };
    PageConfiguration.prototype.setCurrentPage = function (page) {
        var localPage = page;
        if (localPage === "last") {
            localPage = this.pageCount;
        }
        if (localPage < 1) {
            localPage = 1;
        }
        else if (localPage > this.pageCount) {
            localPage = this.pageCount > 0 ? this.pageCount : 1;
        }
        var pageOffset = (localPage - 1) * this.defaultPageSize;
        var pageSize = this.defaultPageSize;
        if (this.pageCount === 0) {
            this.pageSize = 0;
        }
        else if (pageOffset + pageSize > this.totalItems) {
            this.pageSize = this.totalItems - pageOffset;
        }
    };
    PageConfiguration.prototype.setRecordCount = function (recordCount) {
        this.itemsPerPage = this.pageSize;
        this.totalItems = recordCount;
        var itemsPerPage = this.defaultPageSize;
        this.pageCount = ((this.totalItems + itemsPerPage - 1) / itemsPerPage) | 0;
    };
    return PageConfiguration;
})();
var ScopeConfiguration = (function () {
    function ScopeConfiguration(scope) {
        this.scope = scope;
        this.initializeScope();
    }
    ScopeConfiguration.prototype.initializeScope = function () {
        this.scope.tableColumns = 0;
        this.scope.actions = [];
        this.scope.showOptions = false;
        this.scope.currentPage = 0;
        this.scope.showPagination = false;
        this.scope.paginationItems = 7;
        this.scope.rows = [];
        this.scope.pageLoaded = false;
        this.scope.toolbarButtons = [];
        this.scope.hasNewRecords = false;
        this.scope.updating = false;
        this.scope.recordSearchVisible = false;
        this.scope.recordSearchText = "";
        this.scope.links = [];
        this.scope.columns = [];
        this.scope.hasRecordSearch = false;
    };
    ScopeConfiguration.prototype.onDataDefinitionLoaded = function (dataDefinition) {
        this.scope.links = dataDefinition.links;
        this.scope.columns = dataDefinition.columns;
        this.scope.hasRecordSearch = dataDefinition.hasSearch;
        this.scope.hasOptionsBar = this.scope.columns.length > 0 && (this.scope.actions.length > 0 || this.scope.links.length > 0);
        this.initializeActions(dataDefinition);
        this.initializeColumnScopes();
        this.initializeColumns();
    };
    ScopeConfiguration.prototype.initializeColumnScopes = function () {
        this.scope.columns.forEach(function (column) {
            column.colSpan = 1;
            if (!column.scope || !column.scope.length) {
                column.context = function (obj) { return obj; };
            }
            else {
                column.context = (new Function("obj", "with(obj) { return " + column.scope + "; }"));
            }
        });
    };
    ScopeConfiguration.prototype.initializeActions = function (dataDefinition) {
        var _this = this;
        dataDefinition.actions.forEach(function (action) {
            var visibleFunction;
            if (action.visible && action.visible.length > 0) {
                visibleFunction = new Function("obj", "with(obj) { return " + action.visible + "; }");
            }
            else {
                visibleFunction = function () { return true; };
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
                    _this.scope.actions.push(target);
                    break;
                case ActionType.CREATE:
                    var target = new Action();
                    target.name = action.name;
                    target.text = action.text;
                    target.visible = visibleFunction;
                    target.type = action.parameter;
                    _this.scope.toolbarButtons.push(target);
                    break;
            }
        });
    };
    ScopeConfiguration.prototype.initializeColumns = function () {
        for (var i = 0; i < this.scope.columns.length; i++) {
            var column = this.scope.columns[i];
            this.scope.tableColumns += column.colSpan;
            if (!column.headerClass) {
                column.headerClass = "";
            }
            if (!column.cellClass) {
                column.cellClass = "grid-data";
            }
            else {
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
                }
                else {
                    column.template = "<span " + bind + "=\"" + value + "\"></span>";
                }
            }
        }
    };
    return ScopeConfiguration;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file OptionsBarDirective.ts
 * @author Oleg Gordeev
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file PaginationDirective.ts
 * @author Oleg Gordeev
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/// <reference path="../../typings/requirejs/require.d.ts" />
var RecordListDirectiveLink = (function () {
    function RecordListDirectiveLink(scope, configuration, httpService, qService) {
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
    RecordListDirectiveLink.prototype.setScopeEvents = function () {
        var _this = this;
        this.scope.onSearchRecords = function () { return _this.onSearchRecords(); };
        this.scope.onToggleRecordSearch = function () { return _this.toggleRecordSearch(); };
        this.scope.onRefreshNewRecords = function () { return _this.dataChannelController.refreshNewRecords(); };
        this.scope.onToolbarButtonClick = function (action) { return _this.onToolbarButtonClick(action); };
        this.scope.onClickOptions = function (record, column, event) { return _this.onClickOptions(record, column, event); };
        this.scope.isActionVisible = function (action) { return _this.isActionVisible(action); };
        this.scope.onSortColumn = function (column) { return _this.sortColumn(column); };
        this.scope.getColumnLink = function (column, row) { return RecordListDirectiveLink.extractLink(column.url, row); };
        this.scope.onExecuteAction = function (action) { return _this.executeAction(action); };
        this.scope.onNavigateToLink = function (link) { return _this.configuration.navigate(link); };
    };
    RecordListDirectiveLink.prototype.isActionVisible = function (action) {
        if (this.currentRecord === null || !this.scope.showOptions) {
            return false;
        }
        return action.visibleFunction(this.currentRecord);
    };
    RecordListDirectiveLink.prototype.loadModel = function (configurator) {
        var _this = this;
        this.httpService.get(this.modelId + '.json', { cache: true })
            .then(function (data) {
            _this.onModelLoaded(data.data, configurator);
        }, function (message) {
            if (_this.configuration.errorHandler) {
                _this.configuration.errorHandler(message);
            }
        });
    };
    RecordListDirectiveLink.prototype.onModelLoaded = function (definition, configurator) {
        var _this = this;
        this.dataDefinition = definition;
        if (this.dataDefinition.extensionScript && this.dataDefinition.extensionScript.length) {
            require([this.dataDefinition.extensionScript], function (extensionScript) {
                extensionScript(_this.scope);
                _this.onModelAndExtensionsLoaded(definition, configurator);
            });
        }
        else {
            this.onModelAndExtensionsLoaded(definition, configurator);
        }
    };
    RecordListDirectiveLink.prototype.onModelAndExtensionsLoaded = function (definition, configurator) {
        configurator.onDataDefinitionLoaded(definition);
        this.dataChannelController.onModelLoaded(definition);
        this.dataChannelController.refreshNewRecords();
    };
    RecordListDirectiveLink.prototype.onToolbarButtonClick = function (action) {
        var _this = this;
        if (this.scope.updating) {
            return;
        }
        this.scope.actionHandler(action.name, null).then(function (record) {
            _this.configuration.editRecord(record, function (record) {
                var deferred = _this.qService.defer();
                _this.scope.actionHandler(action.name, record)
                    .then(function () {
                    deferred.resolve();
                }, function (message) { return deferred.reject(message); });
                return deferred.promise;
            });
        });
    };
    RecordListDirectiveLink.prototype.onSearchRecords = function () {
        if (this.scope.recordSearchText.length > 0) {
            this.filter = {
                search: this.scope.recordSearchText
            };
        }
        else {
            this.filter = null;
        }
        this.dataChannelController.refreshNewRecords();
    };
    RecordListDirectiveLink.prototype.toggleRecordSearch = function () {
        this.scope.recordSearchVisible = !this.scope.recordSearchVisible;
        if (!this.scope.recordSearchVisible) {
            if (this.scope.recordSearchText.length > 0) {
                this.scope.recordSearchText = "";
                this.onSearchRecords();
            }
        }
    };
    RecordListDirectiveLink.prototype.hideOptions = function () {
        this.scope.showOptions = false;
    };
    RecordListDirectiveLink.prototype.onClickOptions = function (record, column, event) {
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
        }
        else {
            this.scope.showOptions = !this.scope.showOptions;
        }
        this.currentRecordId = recordId;
        this.currentRecord = record;
    };
    RecordListDirectiveLink.prototype.sortColumn = function (column) {
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
        }
        else {
            current = "up";
        }
        column.sort = current;
        this.hideOptions();
        var field = column.name;
        this.dataChannelController.sort(field, current);
        this.dataChannelController.showPage(1);
    };
    RecordListDirectiveLink.prototype.editCurrentRecord = function (record) {
        var _this = this;
        this.configuration.editRecord(record, function (record) {
            var deferred = _this.qService.defer();
            _this.scope.channel.writeRecords([record])
                .then(function () {
                deferred.resolve();
            }, function (message) {
                deferred.reject(message);
            });
            return deferred.promise;
        });
    };
    RecordListDirectiveLink.prototype.executeAction = function (action) {
        var _this = this;
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
        var actionData = {};
        actionData.id = this.currentRecordId;
        var sendCommand = function () {
            var deferred = _this.qService.defer();
            _this.scope.actionHandler(action.name, actionData)
                .then(function () {
                deferred.resolve();
            });
            return deferred.promise;
        };
        if (action.type === ActionType.RECORD_INITIALIZE_CREATE) {
            this.scope.actionHandler(action.name, actionData)
                .then(function (data) {
                _this.configuration.editRecord(data, function (object) {
                    actionData = object;
                    return sendCommand();
                });
            }, function (message) {
                if (_this.configuration.errorHandler) {
                    _this.configuration.errorHandler(message);
                }
            });
        }
        else if (action.type === ActionType.RECORD_CREATE) {
            this.configuration.editRecord(null, function () {
                return sendCommand();
            });
        }
        else {
            sendCommand().catch(function (message) {
                if (_this.configuration.errorHandler) {
                    _this.configuration.errorHandler(message);
                }
            });
        }
    };
    RecordListDirectiveLink.extractLink = function (text, row) {
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
    };
    return RecordListDirectiveLink;
})();
recordListModule.directive("recordList", ['moduleConfiguration', '$http', '$q',
    function (configuration, httpService, qService) {
        return {
            restrict: 'EA',
            template: templates['views/recordList.jade'],
            scope: {
                model: '=',
                channel: '=',
                actionHandler: '=',
                pageHandler: '='
            },
            link: function (scope) {
                return new RecordListDirectiveLink(scope, configuration, httpService, qService);
            }
        };
    }]);
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file ToolBarDirective.ts
 * @author Oleg Gordeev
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/**
 * @file Smile.ts
 * @author Oleg Gordeev
 */
/**
 * @class Smile
 */
var Smile = (function () {
    function Smile() {
    }
    return Smile;
})();
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
///<reference path="./Smile.ts" />
///<reference path="./IDataSource.ts" />
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
} if (typeof define === 'function' && define.amd) { define(["angular","angular.animate","angular.translate","angular.messages","angular.material","angular.aria","angular.touch"], function (angular,$_v0,$_v1,$_v2,$_v3,$_v4,$_v5) { ___f$(angular); }); } else if (typeof exports === 'object') { var angular = require('angular');require('angular.animate');require('angular.translate');require('angular.messages');require('angular.material');require('angular.aria');require('angular.touch'); module.exports = ___f$(angular); } else  { ___f$(angular); } })();
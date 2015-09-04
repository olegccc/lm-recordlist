/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file RecordListDirectiveScope.ts
 * @author Oleg Gordeev
 */

interface RecordListDirectiveScope extends ng.IScope {
    model: string;
    channel: IDataChannelFactory;
    actionHandler: (actionName: string, dataObject: any) => ng.IPromise<any>;
    pageHandler: (page?: string) => string;

    onToolbarButtonClick: (action: Action) => void;
    onRefreshNewRecords: () => void;
    onClickOptions: (record: Record, event) => void;
    onSortColumn: (column: ColumnDefinition) => void;
    onNavigateToLink: (link) => void;
    isActionVisible: (action: Action, record: Record) => boolean;
    onExecuteAction: (action: Action, record: Record) => void;
    linkUrl: (link: LinkDefinition) => string;
    getColumnLink: (column, row) => string;
    onSearchRecords: () => void;
    onToggleRecordSearch: () => void;
    getRecordCount: () => number;
    getPageSize: () => number;

    currentPage: number;
    pageCount: number;
    tableColumns: number;
    actions: Action[];
    columns: ColumnDefinition[];
    hasOptionsBar: boolean;
    rows: Record[];
    showPagination: boolean;
    paginationItems: number;
    pageLoaded: boolean;
    updating: boolean;
    toolbarButtons: Action[];
    hasNewRecords: boolean;
    hasRecordSearch: boolean;
    recordSearchVisible: boolean;
    recordSearchText: string;
    columnsSortable: boolean;
}

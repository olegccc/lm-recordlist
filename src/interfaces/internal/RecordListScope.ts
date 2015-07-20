/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file RecordListScope.ts
 * @author Oleg Gordeev
 */

interface RecordListScope extends ng.IScope {
    onToolbarButtonClick: (action: Action) => void;
    refreshNewRecords: () => void;
    onClickOptions: (record: Record, column: ColumnDefinition, event) => void;
    sortColumn: (column: ColumnDefinition) => void;
    navigateToLink: (link) => void;
    isActionVisible: (action: Action) => boolean;
    executeAction: (action: Action) => void;
    linkUrl: (link: LinkDefinition) => string;
    getColumnLink: (column, row) => string;
    searchRecords: () => void;
    toggleRecordSearch: () => void;

    tableColumns: number;
    actions: Action[];
    currentPage: number;
    pageCount: number;
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

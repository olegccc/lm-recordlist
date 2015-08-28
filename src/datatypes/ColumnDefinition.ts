/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file ColumnDefinition.ts
 * @author Oleg Gordeev
 */

class ColumnDefinition {
    property: string;
    title: string;
    colSpan: number;
    scope: string;
    context: (obj: Record) => any;
    sortable: boolean;
    sort: string;
    headerClass: string;
    cellClass: string;
    align: string;
    template: string;
    allowUnsafe: boolean;
    url: string;
}

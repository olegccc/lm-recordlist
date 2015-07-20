/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file ModelDefinition.ts
 * @author Oleg Gordeev
 */

interface ModelDefinition {
    columns: ColumnDefinition[];
    links: LinkDefinition[];
    optionsTemplate: string;
    manualRefresh: boolean;
    hasSearch: boolean;
    actions: ActionDefinition[];
    type: string;
    recordIds: number[];
    records: Record[];
    extensionScript: string;
}

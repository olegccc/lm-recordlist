/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file IDataChannel.ts
 * @author Oleg Gordeev
 */

interface IDataChannel {
    readIds: () => ng.IPromise<any[]>;
    sortByAndReadIds: (field: string, ascending: boolean) => ng.IPromise<any[]>;
    readRecords: (ids: any[]) => ng.IPromise<IRecord[]>;
    writeRecords: (records: IRecord[]) => ng.IPromise<void>;
    deleteRecords: (ids:any[]) => angular.IPromise<void>;
}

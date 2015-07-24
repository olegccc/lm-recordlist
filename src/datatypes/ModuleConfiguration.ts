/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file ModuleConfiguration.ts
 * @author Oleg Gordeev
 */


class ModuleConfiguration {
    editRecord: (record: IRecord, resolver: (object: IRecord) => ng.IPromise<void>) => ng.IPromise<IRecord>;
    navigate: (url: string) => void;
    pageSize: number;
    errorHandler: (message: string) => void;
}

/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file PaginationDirective.ts
 * @author Oleg Gordeev
 */

interface PaginationDirectiveScope extends ng.IScope {
    items: number;
    records: number;
}

class PaginationDirectiveLink {
    constructor(scope: RecordListDirectiveScope) {

    }
}

recordListModule.directive('recordListPagination', [() => {
    return {
        restrict: 'EA',
        scope: {
            items: '=',
            records: '='
        },
        template: templates['views/paging.jade'],
        link: (scope: RecordListDirectiveScope) => {
            return new PaginationDirectiveLink(scope);
        }
    };
}]);

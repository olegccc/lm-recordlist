/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file ToolbarDirective.ts
 * @author Oleg Gordeev
 */

class ToolbarDirectiveLink {
    constructor(scope: RecordListDirectiveScope) {

    }
}

recordListModule.directive('recordListToolbar', [() => {
    return {
        restrict: 'EA',
        template: templates['views/toolBar.jade'],
        link: (scope: RecordListDirectiveScope) => {
            return new ToolbarDirectiveLink(scope);
        }
    };
}]);

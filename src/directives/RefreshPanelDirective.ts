/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file RefreshPanelDirective.ts
 * @author Oleg Gordeev
 */

class RefreshPanelDirectiveLink {
    constructor(scope: RecordListDirectiveScope) {

    }
}

recordListModule.directive('recordListRefreshPanel', [() => {
    return {
        restrict: 'EA',
        template: templates['views/refreshPanel.jade'],
        link: (scope: RecordListDirectiveScope) => {
            return new RefreshPanelDirectiveLink(scope);
        }
    };
}]);

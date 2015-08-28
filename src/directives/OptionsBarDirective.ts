/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file OptionsBarDirective.ts
 * @author Oleg Gordeev
 */

class OptionsBarDirectiveLink {
    constructor(scope: RecordListDirectiveScope) {

    }
}

recordListModule.directive('recordListOptions', [() => {
    return {
        restrict: 'EA',
        template: templates['views/optionsBar.jade'],
        link: (scope: RecordListDirectiveScope) => {
            return new OptionsBarDirectiveLink(scope);
        }
    };
}]);

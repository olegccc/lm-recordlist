/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * @file PaginationDirective.ts
 * @author Oleg Gordeev
 */

class PaginationPage {
    title: string;
    pageNumber: number;
}

interface PaginationDirectiveScope extends ng.IScope {
    pageSize: number;
    recordCount: number;
    currentPage: number;
    pages: PaginationPage[];
    showFastBackward: boolean;
    showBackward: boolean;
    showForward: boolean;
    showFastForward: boolean;
    onFastBackward: () => void;
    onBackward: () => void;
    onForward: () => void;
    onFastForward: () => void;
    onPage: (PaginationPage) => void;
    showPagination: boolean;
}

class PaginationDirectiveLink {

    private scope: PaginationDirectiveScope;
    private steps: number;
    private fastSteps: number;
    private pageCount: number;

    constructor(scope: PaginationDirectiveScope) {

        this.scope = scope;
        this.steps = 2;
        this.fastSteps = 5;

        scope.$watchGroup(['pageSize', 'recordCount', 'currentPage'], () => {
            this.updateState();
        });

        scope.onFastBackward = () => {
            var newPage = this.scope.currentPage - this.fastSteps;
            if (newPage <= 0) {
                newPage = 1;
            }
            this.scope.currentPage = newPage;
        };

        scope.onBackward = () => {
            if (this.scope.currentPage > 0) {
                this.scope.currentPage--;
            }
        };

        scope.onForward = () => {
            if (this.scope.currentPage < this.pageCount) {
                this.scope.currentPage++;
            }
        };

        scope.onFastForward = () => {
            var newPage = this.scope.currentPage + this.fastSteps;
            if (newPage > this.pageCount) {
                newPage = this.pageCount;
            }
            this.scope.currentPage = newPage;
        };

        scope.onPage = (page: PaginationPage) => {
            this.scope.currentPage = page.pageNumber;
        };

        this.updateState();
    }

    private updateState() {
        this.scope.showPagination = this.scope.recordCount > this.scope.pageSize;
        if (!this.scope.showPagination) {
            return;
        }
        this.pageCount = Math.floor((this.scope.recordCount + this.scope.pageSize-1) / this.scope.pageSize);
        if (this.scope.currentPage < 1) {
            this.scope.currentPage = 1;
        } else if (this.scope.currentPage > this.pageCount) {
            this.scope.currentPage = this.pageCount;
        }
        this.scope.pages = [
            {
                title: this.scope.currentPage.toString(),
                pageNumber: this.scope.currentPage
            }
        ];
        var before = this.scope.currentPage-1;
        var i;
        for (i = 0; i < this.steps && before > 0; before--, i++) {
            this.scope.pages.unshift({
                title: before.toString(),
                pageNumber: before
            });
        }
        var after = this.scope.currentPage+1;
        for (i = 0; i < this.steps && after <= this.pageCount; i++, after++) {
            this.scope.pages.push({
                title: after.toString(),
                pageNumber: after
            });
        }
        this.scope.showBackward = this.scope.currentPage > 1;
        this.scope.showFastBackward = before-1 > 0;
        this.scope.showForward = this.scope.currentPage < this.pageCount;
        this.scope.showFastForward = after+1 <= this.pageCount;
    }
}

recordListModule.directive('recordListPagination', [() => {
    return {
        restrict: 'EA',
        scope: {
            pageSize: '=',
            recordCount: '=',
            currentPage: '='
        },
        template: templates['views/paging.jade'],
        link: (scope: PaginationDirectiveScope) => {
            return new PaginationDirectiveLink(scope);
        }
    };
}]);

class PageConfiguration {

    private pageSize: number;
    private defaultPageSize: number;
    private pageOffset: number;
    private totalItems: number;
    private itemsPerPage: number;
    private pageCount: number;

    constructor(configuration: IRecordListConfiguration) {
        this.defaultPageSize = configuration.pageSize;

        if (this.defaultPageSize <= 0) {
            this.defaultPageSize = 10;
        }

        this.setRecordCount(0);
        this.setCurrentPage(1);
    }

    public isRecordBeforePageEnd(recordIndex: number): boolean {

        if (this.pageSize > 0) {
            return recordIndex < this.pageOffset + this.pageSize;
        }
        return false;
    }

    public hasPagination(): boolean {
        return this.pageSize < this.totalItems;
    }

    public isRecordVisible(recordIndex: number): boolean {
        return this.pageSize > 0 && recordIndex >= this.pageOffset && recordIndex < this.pageOffset + this.pageSize;
    }

    public getVisibleRecords(allRecords: Record[]): Record[] {
        var ret = [];
        var start = this.pageOffset;
        var end = start + this.pageSize;
        for (var i = start; i < end; i++) {
            ret.push(allRecords[i]);
        }
        return ret;
    }

    public setCurrentPage(page) {
        var localPage = page;

        if (localPage === "last") {
            localPage = this.pageCount;
        }

        if (localPage < 1) {
            localPage = 1;
        } else if (localPage > this.pageCount) {
            localPage = this.pageCount > 0 ? this.pageCount : 1;
        }

        this.pageOffset = (localPage - 1) * this.defaultPageSize;
        var pageSize = this.defaultPageSize;

        if (this.pageCount === 0) {
            this.pageSize = 0;
        } else if (this.pageOffset + pageSize > this.totalItems) {
            this.pageSize = this.totalItems - this.pageOffset;
        }

    }

    public setRecordCount(recordCount: number) {
        this.itemsPerPage = this.pageSize;
        this.totalItems = recordCount;
        var itemsPerPage = this.defaultPageSize;
        this.pageCount = ((this.totalItems + itemsPerPage - 1) / itemsPerPage) | 0;
    }
}
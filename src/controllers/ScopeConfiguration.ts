class ScopeConfiguration {

    private scope: RecordListDirectiveScope;

    constructor(scope: RecordListDirectiveScope) {
        this.scope = scope;
        this.initializeScope();
    }

    initializeScope() {
        this.scope.tableColumns = 0;
        this.scope.actions = [];
        this.scope.showOptions = false;
        this.scope.currentPage = 0;
        this.scope.showPagination = false;
        this.scope.paginationItems = 7;
        this.scope.rows = [];
        this.scope.pageLoaded = false;
        this.scope.toolbarButtons = [];
        this.scope.hasNewRecords = false;
        this.scope.updating = false;
        this.scope.recordSearchVisible = false;
        this.scope.recordSearchText = "";
        this.scope.columns = [];
        this.scope.hasRecordSearch = false;
    }

    public onDataDefinitionLoaded(dataDefinition: ModelDefinition) {

        this.scope.hasRecordSearch = dataDefinition.hasSearch;
        this.scope.hasOptionsBar = this.scope.columns.length > 0 && (this.scope.actions.length > 0);
        this.initializeColumns(dataDefinition);
        this.initializeActions(dataDefinition);
        this.initializeColumnScopes();
    }

    private initializeColumnScopes() {
        this.scope.columns.forEach((column: ColumnDefinition) => {
            column.colSpan = 1;
            if (!column.scope || !column.scope.length) {
                column.context = (obj: Record) => { return obj; };
            } else {
                column.context = <(obj: Record) => any>(new Function("obj", "with(obj) { return " + column.scope + "; }"));
            }
        });
    }

    private initializeActions(dataDefinition: ModelDefinition) {

        this.scope.actions = [];

        if (!dataDefinition.actions) {
            return;
        }

        Object.keys(dataDefinition.actions).forEach((name) => {
            var action = dataDefinition.actions[name];
            var visibleFunction : Function;

            if (action.visible && action.visible.length > 0) {
                visibleFunction = new Function("obj", "with(obj) { return " + action.visible + "; }");
            } else {
                visibleFunction = () => { return true; };
            }

            switch (action.type) {
                case ActionType.RECORD:
                case ActionType.RECORD_CREATE:
                case ActionType.RECORD_INITIALIZE_CREATE:
                    var target = new Action();
                    target.name = name;
                    target.title = action.title;
                    target.visible = visibleFunction;
                    target.type = action.type;
                    target.parameter = action.parameter;
                    this.scope.actions.push(target);
                    break;
                case ActionType.CREATE:
                    var target = new Action();
                    target.name = name;
                    target.title = action.title;
                    target.visible = visibleFunction;
                    target.type = action.parameter;
                    this.scope.toolbarButtons.push(target);
                    break;
            }
        });
    }

    private initializeColumns(dataDefinition: ModelDefinition) {

        this.scope.columns = [];
        this.scope.tableColumns = 0;

        if (!dataDefinition.columns) {
            return;
        }

        Object.keys(dataDefinition.columns).forEach((key) => {
            var column = dataDefinition.columns[key];
            column.property = key;
            column.colSpan = column.colSpan || 1;
            this.scope.columns.push(column);
            this.scope.tableColumns += column.colSpan;
            if (!column.headerClass) {
                column.headerClass = "";
            }
            if (!column.cellClass) {
                column.cellClass = "grid-data";
            } else {
                column.cellClass += " grid-data";
            }

            switch (column.align) {
                case "Left":
                    column.cellClass += " grid-left";
                    column.headerClass += " grid-left";
                    break;
                case "Center":
                    column.cellClass += " grid-center";
                    column.headerClass += " grid-center";
                    break;
                case "Right":
                    column.cellClass += " grid-right";
                    column.headerClass += " grid-right";
                    break;
            }

            if (column.ignoreOptions) {
                column.cellClass += " ignore-options";
            }

            if (!column.template || column.template.length === 0) {
                var value = "data." + column.property;
                var bind = "ng-bind";
                if (column.allowUnsafe) {
                    value = "getSafeValue(" + value + ")";
                    bind = "ng-bind-html";
                }

                if (column.url && column.url.length > 0) {
                    column.template = "<a href=\"{{getColumnLink(column, row)}}\" ng-click=\"navigateToView(getColumnLink(column, row))\" " + bind + "=\"" + value + "\"></a>";
                } else {
                    column.template = "<span " + bind + "=\"" + value + "\"></span>";
                }
            }
        });
    }
}
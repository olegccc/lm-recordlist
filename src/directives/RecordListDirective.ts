recordListModule.directive("recordList", ['moduleConfiguration', 'webForms', '$http', '$q',
    (configuration: ModuleConfiguration, inputForm: IWebFormsService, httpService: ng.IHttpService, qService: ng.IQService) => {
    return {
        restrict: 'EA',
        scope: {
            modelId: '=',
            channel: '=',
            currentPage: '=',
            handleAction: '='
        },
        link: function(scope: RecordListDirectiveScope) => {
            return new RecordListController(scope, configuration, inputForm, httpService, qService);
        }
    }
}]);
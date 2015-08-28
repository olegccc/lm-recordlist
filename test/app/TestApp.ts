///<reference path="./TestController.ts" />


var appModule = angular.module('test', ['lm-webforms', 'lm-recordlist']);

appModule.controller('test', ['$scope', 'webForms', '$q', 'recordListConfiguration', TestController]);

import * as angular from 'angular'
import * as ngResource from 'angular-resource'

let app : ng.IModule = angular.module('emptyApp', [
    ngResource
]);

export let EmptyApp = app.name;
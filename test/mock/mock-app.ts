import * as angular from 'angular'
import * as ngResource from 'angular-resource'
import {AbstractResource} from "../../src/abstract-resource"

let app : ng.IModule = angular.module('mockApp', [
    ngResource
]);

app.service('StandardService', AbstractResource({
    url: '/resource/standard'
}));

export let MockApp = app.name;
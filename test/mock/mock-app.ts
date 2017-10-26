import * as angular from 'angular'
import * as ngResource from 'angular-resource'
import {AbstractResource} from "../../src/abstract-resource"

export let DEFAULT_URL = '/resource/standard';

let app : ng.IModule = angular.module('mockApp', [
    ngResource
]);

app.service('StandardService', AbstractResource({
    url: DEFAULT_URL
}));

export let MockApp = app.name;
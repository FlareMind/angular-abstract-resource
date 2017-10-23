import {expect} from 'chai'
import * as angular from 'angular'
import 'angular-mocks'
import {MockApp} from "./mock/mock-app";

describe('AbstractResource', () => {
    let $httpBackend : ng.IHttpBackendService, StandardService : any;

    beforeEach(angular.mock.module(MockApp));

    beforeEach(angular.mock.inject(($injector : ng.auto.IInjectorService, _StandardService_ : any) => {
        $httpBackend = $injector.get('$httpBackend');
        StandardService = _StandardService_;
    }));

    it('should load data', () => {
         $httpBackend.expectGET('/resource/standard').respond([{
             test: 1
         }, {
             test: 2
         }]);

         $httpBackend.flush();

         expect(StandardService.list().length).to.equal(2);
         expect(StandardService.list()[0].test).to.equal(1);
         expect(StandardService.list()[1].test).to.equal(2);
    });
});
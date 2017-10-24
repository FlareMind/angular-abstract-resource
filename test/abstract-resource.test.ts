import {expect} from 'chai'
import * as angular from 'angular'
import 'angular-mocks'
import {MockApp} from "./mock/mock-app";

describe('AbstractResource', () => {
    let $httpBackend : ng.IHttpBackendService,
        StandardService : any;

    beforeEach(angular.mock.module(MockApp));

    beforeEach(angular.mock.inject(($injector : ng.auto.IInjectorService, _StandardService_ : any) => {
        $httpBackend = $injector.get('$httpBackend');
        StandardService = _StandardService_;
    }));

    describe('Data loading', () => {
        describe('After load', () => {
            let testData = [{
                test: 1
            }, {
                test: 2
            }];

            beforeEach(() => {
                $httpBackend.expectGET('/resource/standard').respond(testData);

                $httpBackend.flush();
            });

            it('should load data', () => {
                expect(JSON.stringify(StandardService.list())).to.equal(JSON.stringify(testData));
            });

            it('should not be empty', () => {
                expect(StandardService.isEmpty()).to.be.false;
            });

            it('should be loaded', () => {
                expect(StandardService.isLoaded()).to.be.true;
            });
        });

        describe('Before data load', () => {
            it('should not be empty', () => {
                expect(StandardService.isEmpty()).to.be.false;
            });

            it('should not be loaded', () => {
                expect(StandardService.isLoaded()).to.be.false;
            });
        });

        describe('Empty data load', () => {
            beforeEach(() => {
                $httpBackend.expectGET('/resource/standard').respond([]);

                $httpBackend.flush();
            });

            it('should give an empty list', () => {
                expect(StandardService.list().length).to.equal(0);
            });

            it('should be loaded', () => {
                expect(StandardService.isLoaded()).to.be.true;
            });

            it('should be empty', () => {
                expect(StandardService.isEmpty()).to.be.true;
            });
        });
    });

    describe('Reload', () => {

        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([1]);
            $httpBackend.flush();
        });

        it('should reload the data', () => {
            $httpBackend.whenGET('/resource/standard').respond([2]);

            // Reload the data
            StandardService.reload();

            $httpBackend.flush();

            expect(StandardService.list()[0]).to.equal(2);
        });

        it('should return data and response in a promise', () => {
            $httpBackend.whenGET('/resource/standard').respond([2]);

            // Reload the data
            StandardService.reload().then((object : any) => {
                expect(object).to.haveOwnProperty('data');
                expect(object).to.haveOwnProperty('response');
            });

            $httpBackend.flush();
        });
    });

    describe('Get', () => {

        // Make sure to take care of the standard list command
        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([1]);
            $httpBackend.flush();
        });

        it('should get data', done => {
            $httpBackend.whenGET('/resource/standard/1').respond({
                test: 1
            });

            StandardService.get({
                id: 1
            }).then((data : any) => {
                expect(data.test).to.equal(1);
                done();
            });

            $httpBackend.flush();
        });
    });

    describe('Create', () => {

        // Make sure to take care of the standard list command
        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([{
                id: 1
            }]);
            $httpBackend.flush();
        });

        it('should create data and add it to model', done => {
            let createData = {
                    foo: 'bar'
                },
                reponseData = {
                    id: 2
                };

            // HTTP backend response of create call
            $httpBackend.whenPOST('/resource/standard', (data : any) => data === JSON.stringify(createData))

                .respond(201, reponseData);

            StandardService.create(createData).then((data: any) => {

                /*
                 * Check that the new item is added, that it is added in the correct order and that the old one is
                 * still there
                 */
                expect(StandardService.list().length).to.equal(2);
                expect(StandardService.list()[0].id).to.equal(1);
                expect(StandardService.list()[1].id).to.equal(2);
                done();
            });


            $httpBackend.flush();
        });
    });

    describe('Delete', () => {

        // Make sure to take care of the standard list command
        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([{
                id: 112345
            }, {
                id: 112346
            }]);
            $httpBackend.flush();
        });

        it('should remove an item', done => {

            $httpBackend.whenDELETE('/resource/standard/112345')

                .respond(204);

            StandardService.list()[0].$delete().then((object : any) => {

                // Make sure that the item is removed
                expect(object.id).to.equal(112345);
                expect(StandardService.list().length).to.equal(1);
                done();
            });

            $httpBackend.flush();
        });
    });

    describe('Update', () => {

        // Make sure to take care of the standard list command
        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([{
                id: 1234,
                foo: 'bar'
            }]);
            $httpBackend.flush();
        });

        it('should update the item', () => {

            let items = StandardService.list(),
                item = items[0];

            item.foo = 'baz';

            let itemCopy = angular.copy(item);

            // HTTP backend response of update call
            $httpBackend.whenPUT('/resource/standard/1234', (data : any) => data === JSON.stringify(itemCopy))
                .respond(itemCopy);

            item.$update().then((object : any) => {

                // Check that the item has updated
                expect(object.foo).to.equal('baz');
            });

            $httpBackend.flush();
        });

    });

    describe('Events', () => {

        // Make sure to take care of the standard list command
        beforeEach(() => {
            $httpBackend.expectGET('/resource/standard').respond([{
                id: 1,
                foo: 'bar'
            }]);
            $httpBackend.flush();
        });

        it('should call UPDATE', done => {

            StandardService.on('update', (event : any) => {
                expect(event).to.haveOwnProperty('data');
                expect(event).to.haveOwnProperty('response');
                done();
            });

        });

        it('should call RELOAD', done => {

            StandardService.on('reload', (event : any) => {
                expect(event).to.haveOwnProperty('data');
                expect(event).to.haveOwnProperty('response');
                done();
            });

            $httpBackend.whenGET('/resource/standard').respond([2]);

            // Reload the data
            StandardService.reload();

            $httpBackend.flush();
        });

        it('should call CREATE', done => {

            let createData = {
                foo: 'bar'
            }, reponseData = {
                id: 2
            };

            StandardService.on('create', (event : any) => {
                expect(event.object.id).to.equal(reponseData.id);
                done();
            });

            // HTTP backend response of create call
            $httpBackend.whenPOST('/resource/standard').respond(201, reponseData);

            StandardService.create(createData);

            $httpBackend.flush();
        });

        it('should call DELETE', done => {

            $httpBackend.whenDELETE('/resource/standard/1').respond(204);

            StandardService.on('delete', (event : any) => {
                expect(event.object.id).to.equal(1);
                done();
            });

            StandardService.list()[0].$delete();

            $httpBackend.flush();
        });

        it('should call ERROR', done => {

            StandardService.on('error', (event : any) => {
                expect(event).to.haveOwnProperty('status');
                done();
            });

            $httpBackend.whenGET('/resource/standard').respond(401);

            // Reload the data
            StandardService.reload().catch(() => {});

            $httpBackend.flush();
        });
    });

    describe('Custom behaviour', () => {

    });
});
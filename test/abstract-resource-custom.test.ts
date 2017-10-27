import {expect} from 'chai'
import * as angular from 'angular'
import 'angular-mocks'
import {EmptyApp} from "./mock/empty-app";
import {AbstractResource} from "../src/abstract-resource"

const DEFAULT_URL = '/resource/standard';

describe('AbstractResource Custom', () => {
    let $httpBackend: ng.IHttpBackendService,
        $injector: ng.auto.IInjectorService;

    beforeEach(angular.mock.module(EmptyApp));

    beforeEach(angular.mock.inject((_$injector_: ng.auto.IInjectorService) => {
        $injector = _$injector_;
        $httpBackend = $injector.get('$httpBackend');
    }));

    describe('Custom behaviour', () => {

        it('should allow a different primary key', done => {

            $httpBackend.whenGET(DEFAULT_URL).respond([{
                foo: 1
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                primaryKey: 'foo'
            }), {});

            $httpBackend.flush();

            $httpBackend.expectGET(DEFAULT_URL + '/1').respond({
                foo: 1,
                test: 'bar'
            });

            abstractResource.list()[0].$get().then((object: any) => {
                expect(object.test).to.equal('bar');
                done();
            });

            $httpBackend.flush();


        });

        it('should have possibility for default params', () => {

            $httpBackend.expectGET(DEFAULT_URL + '?foo=bar').respond([{
                id: 1
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                defaultParams: {
                    foo: 'bar'
                }
            }), {});

            $httpBackend.flush();
        });

        it('should have possibility for extensions', done => {
            $httpBackend.expectGET(DEFAULT_URL).respond([{
                id: 1
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                extension: function() {
                    this.on('update', (event : any) => {
                        expect(event).to.haveOwnProperty('data');
                        expect(event).to.haveOwnProperty('response');
                        done();
                    });
                },
            }), {});

            $httpBackend.flush();
        });

        it('should work with single items', () => {
            $httpBackend.expectGET(DEFAULT_URL).respond([{
                foo: 'bar'
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                single: true
            }), {});

            $httpBackend.flush();

            expect(abstractResource.list()).to.haveOwnProperty('foo');
            expect(abstractResource.list().foo).to.equal('bar');
        });

        it('should have possibility for incremental updates', () => {
            $httpBackend.expectGET(DEFAULT_URL + '?skip=').respond([{
                id: 1
            }, {
                id: 2
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                incremental: true
            }), {});

            $httpBackend.flush();

            $httpBackend.expectGET(DEFAULT_URL + '?skip=1,2').respond([{
                id: 3
            }]);

            abstractResource.reload();

            $httpBackend.flush();

            expect(abstractResource.list().length).to.equal(3);
        });

        describe('Trailing slashes', () => {

            it('should be possible to not strip trailing slashes in the url', () => {

                // Throws error if the trailing slash is missing
                $httpBackend.expectGET(DEFAULT_URL + '/').respond([{
                    id: 1
                }]);

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    stripTrailingSlashes: false
                }), {});

                $httpBackend.flush();

            });

            it('should be possible to not strip trailing slashes in the url when an index is used', () => {
                $httpBackend.whenGET(DEFAULT_URL + '/').respond([{
                    id: 1
                }]);

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    stripTrailingSlashes: false
                }), {});

                $httpBackend.flush();

                // Throws error if the trailing slash is missing
                $httpBackend.expectGET(DEFAULT_URL + '/1/').respond({
                    id: 1,
                    foo: 'bar'
                });

                abstractResource.list()[0].$get();

                $httpBackend.flush();
            });
        });

        it('should be possible to set a custom create', done => {
            $httpBackend.whenGET(DEFAULT_URL).respond([{
                id: 1
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                customCreate: (object, data, config) => {
                    expect(object).to.not.be.undefined;
                    expect(object.server).to.be.true;
                    expect(data).to.not.be.undefined;
                    expect(config).to.not.be.undefined;
                    done();
                }
            }), {});

            $httpBackend.flush();

            $httpBackend.expectPOST(DEFAULT_URL).respond(201, {
                id: 2,
                server: true
            });

            abstractResource.create({
                foo: 'bar'
            });

            $httpBackend.flush();
        });

        it('should be possible to set a custom delete', done => {
            $httpBackend.whenGET(DEFAULT_URL).respond([{
                id: 1
            }]);

            let abstractResource = $injector.invoke(AbstractResource({
                url: DEFAULT_URL,
                customDelete:(object, data, config) => {
                    expect(object).to.not.be.undefined;
                    expect(data).to.not.be.undefined;
                    expect(config).to.not.be.undefined;
                    done();
                }
            }), {});

            $httpBackend.flush();

            $httpBackend.expectDELETE(DEFAULT_URL + '/1').respond(204);

            abstractResource.list()[0].$delete();

            $httpBackend.flush();
        });

        describe('Pages', () => {

            it('should record page information', () => {
                $httpBackend.expectGET(DEFAULT_URL + '?page=1').respond({
                    next: DEFAULT_URL + "?page=2",
                    previous: "",
                    results: [{
                        id: 1
                    }]
                });

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    pages: true
                }), {});

                $httpBackend.flush();

                expect(abstractResource.getPage()).to.equal(1);
                expect(abstractResource.hasNext()).to.be.true;
                expect(abstractResource.getNext()).to.equal(2);
                expect(abstractResource.hasPrevious()).to.be.false;
            });

            it('should jump to next page', done => {
                $httpBackend.expectGET(DEFAULT_URL + '?page=1').respond({
                    next: DEFAULT_URL + "?page=2",
                    previous: "",
                    results: [{
                        id: 1
                    }]
                });

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    pages: true
                }), {});

                $httpBackend.flush();

                $httpBackend.expectGET(DEFAULT_URL + '?page=2').respond({
                    next: DEFAULT_URL + "?page=3",
                    previous: DEFAULT_URL + "?page=1",
                    results: [{
                        id: 1
                    }]
                });

                abstractResource.nextPage().then((object : any) => {
                    expect(object).to.haveOwnProperty('page');
                    expect(object.page).to.be.equal(2);
                    expect(object).to.haveOwnProperty('data');
                    expect(object).to.haveOwnProperty('response');
                    done();
                });

                $httpBackend.flush();
            });

            it('should jump to previous page', done => {
                $httpBackend.expectGET(DEFAULT_URL + '?page=1').respond({
                    next: DEFAULT_URL + "?page=2",
                    previous: "",
                    results: [{
                        id: 1
                    }]
                });

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    pages: true
                }), {});

                $httpBackend.flush();

                $httpBackend.expectGET(DEFAULT_URL + '?page=2').respond({
                    next: DEFAULT_URL + "?page=3",
                    previous: DEFAULT_URL + "?page=1",
                    results: [{
                        id: 1
                    }]
                });

                abstractResource.nextPage();

                $httpBackend.flush();

                $httpBackend.expectGET(DEFAULT_URL + '?page=1').respond({
                    next: DEFAULT_URL + "?page=2",
                    previous: "",
                    results: [{
                        id: 1
                    }]
                });

                abstractResource.previousPage().then((object : any) => {
                    expect(object).to.haveOwnProperty('page');
                    expect(object.page).to.be.equal(1);
                    expect(object).to.haveOwnProperty('data');
                    expect(object).to.haveOwnProperty('response');
                    done();
                });

                $httpBackend.flush();
            });

            it('should jump to specified page', done => {
                $httpBackend.expectGET(DEFAULT_URL + '?page=1').respond({
                    next: DEFAULT_URL + "?page=2",
                    previous: "",
                    results: [{
                        id: 1
                    }]
                });

                let abstractResource = $injector.invoke(AbstractResource({
                    url: DEFAULT_URL,
                    pages: true
                }), {});

                $httpBackend.flush();

                $httpBackend.expectGET(DEFAULT_URL + '?page=10').respond({
                    next: DEFAULT_URL + "?page=11",
                    previous: DEFAULT_URL + "?page=9",
                    results: [{
                        id: 1
                    }]
                });

                abstractResource.loadPage(10).then((object : any) => {
                    expect(object).to.haveOwnProperty('page');
                    expect(object.page).to.be.equal(10);
                    expect(object).to.haveOwnProperty('data');
                    expect(object).to.haveOwnProperty('response');
                    done();
                });

                $httpBackend.flush();
            });
        });
    });
});
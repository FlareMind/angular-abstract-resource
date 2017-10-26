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

        it('should have possibility for automatic updates');

        it('should have possibility for incremental updates');

        it('should be possible to update on errors');

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

            it('should record page information');

            it('should send page information');

            it('should jump to next page');

            it('should jump to previous page');
        });
    });
});
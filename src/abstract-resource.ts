import 'core-js/es6/object'
import 'core-js/es6/array'
import {IConfig} from "./interfaces/config";
import {ICancel, IObservableEvent, IObserver, Observable} from "typescript-observable";
import {ObserverCallback} from "typescript-observable/dist/interfaces/observer";
import {Pagination} from "./pagination";
import hashCode from "./hash";
import Event from './events';

const REQUIRED_VALUES : string[] = ['url'];

const DEFAULT_VALUES : IConfig = {
    url: '',
    primaryKey: 'id',
    defaultParams: {},
    extension: () => {},
    single: false,
    update: false,
    updateTime: 300000,
    incremental: false,
    pages: false,
    errorUpdate: true,
    errorUpdateTime: 10000,
    customMethods: {},
    stripTrailingSlashes: true,
    customDelete: (object : any, data : any, config : IConfig) => {
        let id = object[config.primaryKey],
            index = data.findIndex((item : any) => item[config.primaryKey] === id);

        data.splice(index, 1);
    },
    customCreate: (object : any, data : any, config : IConfig) => {
        data.push(object);
    }
};

export let AbstractResource = (config : IConfig) => function($resource : ng.resource.IResourceService, $injector : ng.auto.IInjectorService, $q : ng.IQService, $timeout : ng.ITimeoutService) {
    this.$inject = ['$resource', '$injector', '$q', '$timeout'];

    /*
     * Check that all the required properties are set
     */
    (() => {
        let keys = Object.keys(config);
        REQUIRED_VALUES.forEach(item => {
            if (keys.indexOf(item) === -1) {
                throw new Error('AbstractResource config requires the property `' + item + '`!');
            }
        });
    })();

    /*
     * Create config object with default values
     */
    config = Object.assign({}, DEFAULT_VALUES, config);

    // Add a trailing slash to url if missing
    config.url += !config.url.endsWith('/') ? '/' : '';



    /*
     * Make the service observable
     */
    let observable = new Observable();

    /*
     * see documentation for typescript-observable
     * https://www.npmjs.com/package/typescript-observable
     */
    this.on = (type: string | IObservableEvent | (string | IObservableEvent)[],
               callback: ObserverCallback | IObserver) : ICancel => observable.on(type, callback);

    /*
     * see documentation for typescript-observable
     * https://www.npmjs.com/package/typescript-observable
     */
    this.off = (observer: IObserver) : boolean => observable.off(observer);



    /*
     * Handle pagination
     */
    let pagination : Pagination = new Pagination(),
        paginationMethods : any = config.pages ? pagination.getMethods() : {};


    let primaryKeyDefaultParam : any = {};
    primaryKeyDefaultParam[config.primaryKey] = '@' + config.primaryKey;


    /*
     * Define the resource object
     */
    let Resource = $resource(

        // Specify the url with primary key as a parameter
        config.url + ':' + config.primaryKey + '/',

        // Set default params
        Object.assign(primaryKeyDefaultParam, config.defaultParams),

        Object.assign({}, {
                'update': {
                    method: 'PUT'
                },

                'silentDelete': {
                    method: 'DELETE'
                }
            },
            paginationMethods,
            config.customMethods
        ),

        {
            stripTrailingSlashes: config.stripTrailingSlashes
        }
    );

    /*
     * Define a custom delete method
     */
    Resource.prototype.$remove = Resource.prototype.$delete = function() {
        return this.$silentDelete(() => {
            observable.notify(Event.DELETE, {
                object: this
            });

            config.customDelete(this, data, config);
        });
    };



    /*
     * Create an object to store the data
     */
    let data : any = config.single ? {} : [],
        hash : number = hashCode(data),
        isLoaded : boolean = false;

    let updateResource = (reload : boolean) => $q((resolve : Function, reject : Function) => {

        // Default to false
        reload = reload === true;

        let params : any = {};

        // Add page if available
        if (config.pages) {
            params.page = pagination.getPage();
        }

        // Give items to skip
        if (config.incremental) {
            params.skip = data.map((item : any) => item[config.primaryKey]).join(',');
        }


        Resource.query(params).$promise.then((response : any) => {

            isLoaded = true;

            // Remove old data
            if (!config.incremental && !config.single) {
                data.splice(0, data.length);
            } else if (config.single) {
                Object.keys(data).forEach(key =>{ delete data[key]; });
            }

            // Add new data
            if (config.single) {
                Object.assign(data, response[0]);
            } else {
                data.push.apply(data, response);
            }

            let notifyData = Object.assign({
                data: data,
                response: response
            }, config.pages ? { page: pagination.getPage() } : {});

            // Check if hash is the same
            let newHash = hashCode(data);

            if(hash !== newHash) {
                hash = newHash;

                observable.notify(reload ? Event.RELOAD : Event.UPDATE, notifyData);
            }

            // Update if enabled
            if (config.update && !reload) {
                $timeout(updateResource, config.updateTime);
            }

            resolve(notifyData);
        }, (error: any) => {

            if (config.errorUpdate) {
                $timeout(() => {
                    updateResource(false).then(() => {}, () => {});
                }, config.errorUpdateTime);
            }

            observable.notify(Event.ERROR, error);

            reject(error);
        });
    });

    updateResource(false).then(() => {}, () => {});

    /*
     * List all data
     */
    this.list = () => data;

    /*
     * Add functions add, save and get if the resource is not a single item
     */
    if (!config.single) {
        this.create = (params : any) : any => new Resource(params).$save((object : any) => {

            observable.notify(Event.CREATE, {
                object: object
            });

            config.customCreate(object, data, config);
        });

        this.get = (params : any) : any => Resource.get(params).$promise;

        this.save = () : void => {
            data.forEach((item : any) => {
                item.$update();
            });

            hash = hashCode(data);
        }
    }

    this.isLoaded = () : boolean => isLoaded;

    this.isEmpty = () : boolean => isLoaded && (config.single ? Object.keys(data) : data).length === 0;

    this.reload = () : any => updateResource(true);

    if (config.pages) {

        this.getPage = () : number => pagination.getPage();

        this.hasNext = () : boolean => pagination.hasNext();

        this.hasPrevious = () : boolean => pagination.hasPrevious();

        this.getNext = () : number => pagination.getNext();

        this.getPrevious = () : number => pagination.getPrevious();

        this.nextPage = () : any => {
            if (pagination.nextPage()) {
                return updateResource(true);
            }

            return $q.reject({
                message: 'No next page'
            });
        };

        this.previousPage = () : any => {
            if (pagination.previousPage()) {
                return updateResource(true);
            }

            return $q.reject({
                message: 'No previous page'
            });
        };

        this.loadPage = (page : number) : any => {
            if (pagination.setPage(page)) {
                return updateResource(true);
            }

            return $q.reject({
                message: 'Illegal page number'
            });
        }
    }

    return Object.assign(this, $injector.invoke(config.extension, this));
};
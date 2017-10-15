import 'core-js/es6/object'
import {IConfig} from "./interfaces/config";

const REQUIRED_VALUES : string[] = ['url'];

const DEFAULT_VALUES : IConfig = {
    url: '',
    trailingUrlSlash: true,
    extension: () => {},
    single: false,
    update: 0
};

export let AbstractResource = (config : IConfig) => ($resource : ng.resource.IResourceService, $injector : ng.auto.IInjectorService, $q : ng.IQService, $timeout : ng.ITimeoutService) => {
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

    config = Object.assign({}, DEFAULT_VALUES, config);

    let resource : any = config.single ? {} : [];

    let updateResource = () => $q((resolve : Function, reject : Function) => {

    });
};
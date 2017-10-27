# angular-abstract-resource
This is an abstract resource class for AngularJs that makes resource handling easier to implement.

## Basic usage

``` javascript
import {AbstractResource} from 'angular-abstract-resource'
import ngResource from 'angular-resource'

angular.module('someApp', [
    ngResource
])
    .service('SomeResource', AbstractResource({
        url: '/path/to/resources'
    }))

    .controller('SomeController', function(SomeResource) {

        // Binds loaded resources to controller, can be accessed in the templates.
        this.resource = SomeResource.list();

        // Reload resources
        SomeResource.reload().then(response => {
            // Reload complete
            // ...
        });

        // Get the first item in the resource list
        this.get = () => {
            resource[0].$get().then(response => {
                // The resource
                // ...
            });
        }

        // Get the first item in the resource list
        this.create = () => {
            SomeResource.create({
                foo: 'bar'
            }).then(response => {
                // Item added
                // ...

            })
        }

        // Remove the first item in the resource list
        this.remove = () => {
            resource[0].$delete().then(response => {
                // Delete complete
                // ...
            });
        }
    });
```

## Parameters
These are the parameters that can be given to the AbstractResource.
* `url` {string} - The url to the resource on the server.
* `primaryKey` {string} (default `'id'`) - The primary key for the resources. When a get or delete call is made the primary key will be added to the end of the url.
* `defaultParams` {object} (default `{}`) - A dictionary of default parameters sent with each request.
* `extension` {function()} (default `() => {}`) - A function that can extend the functionality of the AbstractResource. The function has the AbstractResource injected to `this`.
* `single` {boolean} (default `false`) - If set to true the class only loads one object.
* `update` {boolean} (default `false`) - If the resource should be updated automatically.
* `updateTime` {number} (default `300000`) - Time between updates if `update` is true.
* `incremental` {boolean} (default `false`) - If the resource should be loaded incrementally. Will add the param `skip` with a list of primary keys for already loaded resources.
* `pages` {boolean} (default `false`) - If pages should be used. Works with Django Rest Framework.
* `errorUpdate` {boolean} (default `true`) - Reload when if an error HTTP code is returned.
* `errorUpdateTime` {number} (default `10000`) - Time between error updates.
* `customMethods` {object} (default `{}`) - Methods to be added to the resource.
* `stripTrailingSlashes` {boolean} (default `true`) - Strip trailing slashes in the url.
* `customAdd` {function(object, data, config)} - Custom method for adding items to the loaded resource.
* `customDelete` {function(object, data, config)} - Custom method for deleting items to the loaded resource.
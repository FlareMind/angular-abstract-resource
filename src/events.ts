import {IObservableEvent} from "typescript-observable";

let
    /*
     * Called when any change to the data is made.
     */
    CHANGE : IObservableEvent = {
        parent: null,
        name: 'change'
    },

    /*
     * Called when a new item is created.
     */
    CREATE : IObservableEvent = {
        parent: CHANGE,
        name: 'create'
    },

    /*
     * Called when user deletes an item.
     */
    DELETE: IObservableEvent = {
        parent: CHANGE,
        name: 'delete'
    },

    /*
     * Called when the data is updated from the server.
     */
    UPDATE : IObservableEvent = {
        parent: CHANGE,
        name: 'update'
    },

    /*
     * Called when an error occurs
     */
    ERROR : IObservableEvent = {
        parent: null,
        name: 'error'
    },

    /*
     * Called when the user called a reload.
     */
    RELOAD : IObservableEvent = {
        parent: CHANGE,
        name: 'reload'
    };

export default {CHANGE, CREATE, DELETE, UPDATE, ERROR, RELOAD};
import {IPaginationSettings} from "./interfaces/pagination-settings";

export class Pagination {

    settings : IPaginationSettings;

    constructor() {
        this.settings = {
            nextPage: null,
            previousPage: null,
            page: 1
        }
    }

    getMethods() : any {
        return {
            query: {
                method: 'GET',
                isArray: true,
                transformResponse: (data : any) => {

                    /*
                     * Angular expects a list, but backend sends page info also. Extract page info and then
                     * return the list.
                     */
                    this.settings.nextPage = Pagination.getPageNumber(data.next);
                    this.settings.previousPage = Pagination.getPageNumber(data.previous);
                    return data.results;
                }
            }
        }
    }

    hasPrevious() : boolean {
        return this.getPrevious() !== null;
    }

    getPrevious() : number | null {
        return this.settings.previousPage;
    }

    previousPage() : boolean {
        if (this.hasPrevious()) {
            this.settings.page = this.settings.previousPage;
            return true;
        }

        return false;
    }

    hasNext() : boolean {
        return this.getNext() !== null;
    }

    getNext() : number | null {
        return this.settings.nextPage;
    }

    nextPage() : boolean {
        if (this.hasNext()) {
            this.settings.page = this.settings.nextPage;
            return true;
        }

        return false;
    }

    getPage() : number {
        return this.settings.page;
    }

    setPage(page : number) : boolean {
        if (page > 0) {
            this.settings.page = page;
            return true;
        }

        return false;
    }

    private static getPageNumber(link : string) : number | null {
        if (link === null) {
            return null;
        }

        return Number((/page=([\d]+)/.exec(link) || [null])[1]) || null;
    }
}

export interface IConfig {
    url : string;
    primaryKey?: string;
    defaultParams?: any;
    trailingUrlSlash?: boolean;
    extension?: Function;
    single?: boolean;
    update?: boolean;
    updateTime?: number;
    incremental?: boolean;
    pages?: boolean;
    errorUpdate?: boolean;
    errorUpdateTime?: number;
    customMethods?: any;
    stripTrailingSlashes?: boolean;
    customDelete?: (object: any, data: any, config : IConfig) => void;
    customCreate?: (object: any, data: any, config: IConfig) => void;
}
export class Routing {
    public static ROUTING_OPTIONS: any = {
        "local": { defaultContextPath: "/online" },
        "test": { defaultContextPath: "/online" },
        "prod": { defaultContextPath: "/online" },
    };

    public static ROUTING_MODE = "local";
}

export class DataSources {
    // Set at build time from VITE_API_URL: "/api" when this site's nginx serves the API (the default), or a full URL
    public static API_URL: string = import.meta.env.VITE_API_URL;

    public static PATTERN_QUERY_API_URL: any = {
        "webchem": "https://webchem.ncbr.muni.cz/Platform/PatternQuery/ValidateQuery",
    }

    public static ANNOTATION_API_URL: any = {
        "channelsdb2": "https://channelsdb2.biodata.ceitec.cz/api",
    }

    public static PATTERN_QUERY_MODE = "webchem";
    public static ANNOTATION_API_MODE = "channelsdb2";
}

export class CommonOptions {
    public static DEBUG_MODE = false;
    public static CHANNELSDB_LINK_DETAIL_URL = "https://channelsdb2.biodata.ceitec.cz/detail/pdb";
}

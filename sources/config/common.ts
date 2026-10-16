export class Routing {
    public static ROUTING_OPTIONS: any = {
        "local": { defaultContextPath: "/online" },
        "test": { defaultContextPath: "/online" },
        "prod": { defaultContextPath: "/online" },
    };

    public static ROUTING_MODE = "local";
}

export class DataSources {
    public static API_URL: any = {
        "upol": "https://api.mole.upol.cz",
    }

    public static PATTERN_QUERY_API_URL: any = {
        "webchem": "https://webchem.ncbr.muni.cz/Platform/PatternQuery/ValidateQuery",
    }

    public static ANNOTATION_API_URL: any = {
        "channelsdb2": "https://channelsdb2.biodata.ceitec.cz/api",
    }

    public static MODE = "upol";
    public static PATTERN_QUERY_MODE = "webchem";
    public static ANNOTATION_API_MODE = "channelsdb2";
}

export class CommonOptions {
    public static DEBUG_MODE = false;
    public static CHANNELSDB_LINK_DETAIL_URL = "https://channelsdb2.biodata.ceitec.cz/detail/pdb";
}

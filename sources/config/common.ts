export class Routing {
    public static ROUTING_OPTIONS: any = {
        "local": { defaultContextPath: "/online" },
        "test": { defaultContextPath: "/online" },
        "prod": { defaultContextPath: "/online" },
    };

    // public static ROUTING_MODE = "unknown";
    public static ROUTING_MODE = "local";
}

export class DataSources {
    public static API_URL: any = {
        // "webchem": "https://webchem.ncbr.muni.cz/API/MOLE",
        "upol": "https://api.mole.upol.cz",
        "webchem": "https://webchem.ncbr.muni.cz/API/MOLE",
    }

    public static PATTERN_QUERY_API_URL: any = {
        "webchem": "https://webchem.ncbr.muni.cz/Platform/PatternQuery/ValidateQuery",
    }

    public static ANNOTATION_API_URL: any = {
        // "webchemdev": "https://webchemdev.ncbr.muni.cz/API/ChannelsDB",
        "webchemdev": "https://channelsdb2.biodata.ceitec.cz/api",
        "webchem": "https://webchem.ncbr.muni.cz/API/ChannelsDB"
    }

    public static MODE = "upol";
    public static PATTERN_QUERY_MODE = "webchem";
    public static ANNOTATION_API_MODE = "webchemdev";
}

export class CommonOptions {
    public static DEBUG_MODE = false;
    public static CHANNELSDB_LINK_DETAIL_URL = "https://channelsdb2.biodata.ceitec.cz/detail/pdb";
}
/*
export let ROUTING_OPTIONS:any = {
    "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1", useParameterAsPid:true},
    "test":{defaultContextPath: "/online/<?pid>", defaultPid:"5an8", useLastPathPartAsPid:true},
    "prod":{defaultContextPath: "/online", defaultPid:"5an8", useLastPathPartAsPid:true},
};
*/
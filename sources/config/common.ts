export class DataSources {
    // Set at build time from VITE_API_URL: a path served by this site's nginx, "/api" by default. The API sends no
    // CORS headers, so the browser must call it from the same origin, never another site's URL.
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

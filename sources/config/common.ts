namespace Config{

    export class Routing{
        public static ROUTING_OPTIONS:any = {
            "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1"},
            "test":{defaultContextPath: "/online"},
            "prod":{defaultContextPath: "/online"},
        };

        public static ROUTING_MODE = "unknown";
    }

    export class DataSources{
        public static API_URL:any = {
            "local":"https://webchem.ncbr.muni.cz/API/MOLE",
            "test":"https://webchem.ncbr.muni.cz/API/MOLE",
            "prod":"https://api.mole.upol.cz",
        }

        public static MODE = "unknown";
    }
    /*
    export let ROUTING_OPTIONS:any = {
        "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1", useParameterAsPid:true},
        "test":{defaultContextPath: "/online/<?pid>", defaultPid:"5an8", useLastPathPartAsPid:true},
        "prod":{defaultContextPath: "/online", defaultPid:"5an8", useLastPathPartAsPid:true},
    };
    */
}
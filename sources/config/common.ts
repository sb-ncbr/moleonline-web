namespace Config{

    export class Routing{
        public static ROUTING_OPTIONS:any = {
            "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1", useParameterAsPid:true},
            "test":{defaultContextPath: "/online/<?pid>", defaultPid:"5an8", useLastPathPartAsPid:true},
            "prod":{defaultContextPath: "/online", defaultPid:"5an8", useLastPathPartAsPid:true},
        };

        public static ROUTING_MODE = "unknown";
    }
    /*
    export let ROUTING_OPTIONS:any = {
        "local":{defaultContextPath: "/online", defaultCompId:"compid", defaultSubmitId:"1", useParameterAsPid:true},
        "test":{defaultContextPath: "/online/<?pid>", defaultPid:"5an8", useLastPathPartAsPid:true},
        "prod":{defaultContextPath: "/online", defaultPid:"5an8", useLastPathPartAsPid:true},
    };
    */
}
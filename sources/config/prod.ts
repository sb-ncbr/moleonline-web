import { Routing, DataSources, CommonOptions } from "./common";

Routing.ROUTING_MODE = "prod";
DataSources.MODE = "upol";
DataSources.PATTERN_QUERY_MODE = "webchem";
DataSources.ANNOTATION_API_MODE = "channelsdb2";
CommonOptions.DEBUG_MODE = false;
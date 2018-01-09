namespace Common.Util.Router{
    export interface URLParams{submitId:number, computationId:string, isChannelsDB:boolean};

    export function getParameters(/*suppressDefaultSubmitId?:boolean*/):URLParams|null{
        /*let suppressDefaultSubmitId_ = (suppressDefaultSubmitId===void 0)?false:suppressDefaultSubmitId;*/
        let parametersChannelsDBTest = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/ChannelsDB/g);
        let parameters = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/g);
        let computationId = null;
        let submitId = 0;//(suppressDefaultSubmitId_)?0:1;
        if((parameters===null)||(parameters.length===0)||(parameters.length>3)){
            console.log(parameters);
            console.log("Corrupted url found - cannot parse parameters.");
            return null;
        }
        computationId = parameters[1];
        if(parameters[2]!==''){
            submitId = Number(parameters[2]);
        }

        return {
            submitId,
            computationId,
            isChannelsDB:parametersChannelsDBTest!==null&&parametersChannelsDBTest.length>0
        };
    }

    export function redirect(computationId:string, submitId:number){
        SimpleRouter.GlobalRouter.redirect(`/${computationId}/${submitId}`,true);
    }

    export function fakeRedirect(computationId:string, submitId?:string){
        if(submitId!==void 0){
            SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/${submitId}`,true);
        }
        else{
            SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/`,true);
        }
        Common.Util.LastNSessions.updateWithCurrentSession();
    }

    export function isInChannelsDBMode(){
        let params = getParameters();
        return params!==null&&params.isChannelsDB;
    }

    export function getCurrentUrl(){
        return window.location.href;
    }
}
namespace CommonUtils.Router{
    export function getParameters(/*suppressDefaultSubmitId?:boolean*/):{submitId:number, computationId:string}|null{
        /*let suppressDefaultSubmitId_ = (suppressDefaultSubmitId===void 0)?false:suppressDefaultSubmitId;*/
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
            computationId
        };
    }

    export function redirect(computationId:string, submitId:number){
        SimpleRouter.GlobalRouter.redirect(`/${computationId}/${submitId}`,true);
    }

    export function fakeRedirect(computationId:string, submitId?:number){
        if(submitId!==void 0){
            SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/${submitId}`,true);
        }
        else{
            SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/`,true);
        }
    }
}
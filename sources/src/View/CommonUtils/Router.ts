namespace CommonUtils.Router{
    export function getParameters():{submitId:number, computationId:string}|null{
        let parameters = SimpleRouter.GlobalRouter.getParametersByRegex(/\/online\/([a-zA-Z0-9]+)\/*([0-9]*)/g);
        let computationId = null;
        let submitId = 1;
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

    export function fakeRedirect(computationId:string, submitId:number){
        SimpleRouter.GlobalRouter.fakeRedirect(`/${computationId}/${submitId}`,true);
    }
}
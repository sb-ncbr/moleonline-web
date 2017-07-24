namespace CommonUtils.UrlParameters{
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
}
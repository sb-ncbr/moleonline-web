namespace Common.Util.LastNSessions{
    import Cookies = Common.Util.Cookies;
    import Router = Common.Util.Router;

    export let LAST_N_SESSIONS_N = 5;

    export function getNthSession(n:number){
        let val = Cookies.getCookie(`LastNSessions_${n}`);
        if(val===void 0||val===null||val===""){
            return "";
        }

        return val;
    }

    export function setNthSession(n:number,value:string){
        Cookies.setCookie(`LastNSessions_${n}`,value);
    }

    export function updateWithCurrentSession(){
        let params = Router.getParameters();

        if(params===null){
            return;
        }
        let computationId = params.computationId;
        let submitIdPart = (params.isChannelsDB)?"/ChannelsDB":(params.submitId===0)?"":`/${params.submitId}`

        for(let i=0;i<LAST_N_SESSIONS_N;i++){
            let session = getNthSession(i);
            if(session===""){
                setNthSession(i,`${computationId}${submitIdPart}`);
                return;
            }
            
            let compId = session.split("/")[0];
            if(compId===params.computationId){
                setNthSession(i,`${computationId}${submitIdPart}`);
                return;
            }
        }

        for(let i=1;i<LAST_N_SESSIONS_N;i++){
            setNthSession(i-1,getNthSession(i));
        }

        setNthSession(LAST_N_SESSIONS_N-1,`${computationId}${submitIdPart}`);
    }
}
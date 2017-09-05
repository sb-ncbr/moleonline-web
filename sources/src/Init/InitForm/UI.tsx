namespace MoleOnlineWebUI.InitForm.UI{

    import ApiService =  MoleOnlineWebUI.Service.MoleAPI.ApiService;
    import MoleAPI = MoleOnlineWebUI.Service.MoleAPI;

    interface State{
        app: App,
        useBiologicalUnit: boolean,
        status: string
    };

    export function render(target: Element) {
        ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, {}> {

        private computationId:string;
        private submitId:number;

        state = {
            app: this,
            useBiologicalUnit: false,
            status:null
        };

        componentDidMount() {
        }

        componentWillUnmount(){
        }

        private handleFormSubmit(e:Event){
            e.preventDefault();

            let form = e.target as HTMLFormElement;
            
            let pdbid="";
            let assembly;
            let pores:boolean=false;
            let file;

            for(let idx = 0;idx<form.length;idx++){
                let item = form[idx] as HTMLInputElement;
                let name = item.getAttribute('name');
                console.log(name);
                console.log(item.value);
                switch(name){
                    case 'pdbid':
                        pdbid = item.value;
                        break;
                    case 'assembly':
                        assembly = (item.value!==""&&!item.disabled)?item.value:void 0;
                        break;
                    case 'biological-unit':
                        pores = (item.value!=="")?item.checked:false;
                        break;
                    case 'file':
                        file = (item.files!==null)?item.files[0]:void 0;
                        break;                   
                }
            }

            if(file === void 0){
                ApiService.initWithParams(pdbid,pores,assembly)
                    .then((response)=>{
                        this.handleFormSubmitResponse(response);
                    })
                    .catch((reason)=>{
                        //TODO:...
                        console.log(reason);
                    })
            }
            else{
                let data = new FormData();
                data.append("file",file)
                ApiService.initWithFile(data)
                    .then((response)=>{
                        this.handleFormSubmitResponse(response);
                    })
                    .catch((reason)=>{
                        //TODO:...
                        console.log(reason);
                    })
            }
            
            return false;
        }

        private handleFormSubmitResponse(response:MoleAPI.InitResponse){
            if(response.Status==="FailedInitialization"){
                throw new Error(`API was unable to initialize computation with specified parameters. API responded with message: ${response.ErrorMsg}`);
            }

            this.computationId = response.ComputationId;
            this.submitId = response.SubmitId;

            if(response.Status==="Initialized"){
                console.log("Initialized");
                //TODO: handle initialized
                SimpleRouter.GlobalRouter.redirect(`${this.computationId}`, true);
                return;
            }

            if(response.Status==="Initializing"){
                console.log("Waiting for computation initialization...");
                window.setTimeout(this.waitForComputationInitialization.bind(this),100);
                return;
            }

            throw new Error(`Unexpected computation status recieved from API: ${response.Status}`);
        }

        private waitForComputationInitialization(){
            ApiService.getStatus(this.computationId, this.submitId).then((response)=>{
                console.log(response);
                
                if(response.Status==="FailedInitialization"){
                    throw new Error(`API was unable to initialize computation with specified parameters. API responded with message: ${response.ErrorMsg}`);
                }

                if(response.Status==="Initialized"){
                    console.log("initialized");
                    //TODO: handle initialized
                    SimpleRouter.GlobalRouter.redirect(`/${this.computationId}`, true);
                    return;
                }

                if(response.Status==="Initializing"){
                    console.log("Waiting for computation initialization...");
                    window.setTimeout(this.waitForComputationInitialization.bind(this),100);
                    return;
                }

                throw new Error(`Unexpected computation status recieved from API: ${response.Status}`);
            });
        }

        private biologicalUnitChange(e:Event){
            let el = e.target as HTMLInputElement;
            this.setState({useBiologicalUnit:el.checked});
        }

        render() {            
            return (
            <div className="InitForm">
                <form onSubmit={this.handleFormSubmit.bind(this)} action="/online/" method="post" encType="multipart/form-data">
                    <div className="groupbox">
                        <table style={{width:"100%"}}>
                            <tbody>
                                <tr>
                                    <td><label htmlFor="frm-jobSetup-setupForm-code">PDB ID</label>:</td>
                                    <td><input type="text" name="pdbid" maxLength={4} size={10} className="text" id="frm-jobSetup-setupForm-code" defaultValue="1tqn" />
                                        <div className="hint">PDB ID code as can be found on www.pdb.org, for example 1z10.</div></td></tr>
                                        
                                <tr>
                                    <td><label htmlFor="frm-jobSetup-setupForm-unit">Assembly ID(optional)</label>:</td>
                                    <td><input disabled={this.state.useBiologicalUnit} type="text" name="assembly" maxLength={2} size={10} className="text" id="frm-jobSetup-setupForm-unit" defaultValue="" />
                                        <div className="hint">
                                            no value - assymetric unit (default)
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td><label htmlFor="frm-jobSetup-setupForm-chains">Use biological unit</label>:</td>
                                    <td><input type="checkbox" onChange={this.biologicalUnitChange.bind(this)} name="biological-unit" className="checkbox" defaultChecked={false}/>
                                        <div className="hint">
                                            use biological unit
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}><hr/></td>
                                </tr>
                                <tr>
                                    <td><label htmlFor="frm-jobSetup-setupForm-file">Or upload your own file</label>:</td>
                                    <td>
                                        <input type="file" name="file" className="text" id="frm-jobSetup-setupForm-file" />
                                        <div className="hint">
                                            Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported,
                                            maximal file size is 50MB.<br/>
                                            E.g. cleaned PDB with only one chain and without unnecessary HETATMs.
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div> 

                    <div className="buttons">
                        <input type="submit" name="next" className="button" id="frm-jobSetup-setupForm-next" value="Next"/>
                    </div>
                    <div><input type="hidden" name="do" value="jobSetup-setupForm-submit"/></div>
                </form>
            </div>
            );
        }
    }
}
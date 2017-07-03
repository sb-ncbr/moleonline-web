namespace MoleOnlineWebUI.InitForm.UI{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;

    interface State{
        app: App
    };

    export function render(target: Element) {
        ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, State> {

        state = {
            app: this,
        };

        componentDidMount() {
        }

        componentWillUnmount(){
        }

        private handleFormSubmit(e:Event){
            //console.log(e);
            e.preventDefault();

            let form = e.target as HTMLFormElement;
            
            let pdbid = null;
            let unit = null;
            let chains = null;
            let file = null;

            for(let idx = 0;idx<form.length;idx++){
                let item = form[idx] as HTMLInputElement;
                let name = item.getAttribute('name');
                console.log(name);
                console.log(item.value);
                switch(name){
                    case 'code':
                        pdbid = item.value;
                        break;
                    case 'unit':
                        unit = item.value;
                        break;
                    case 'chains':
                        chains = item.value;
                        break;
                    case 'file':
                        file = item.value;
                        break;                   
                }
            }

            let values = {
                pdbid,
                unit,
                chains,
                file
            }

            console.log(values);
            
            return false;
        }

        render() {            
            return (
            <div>
                <form onSubmit={this.handleFormSubmit.bind(this)} action="/online/" method="post" encType="multipart/form-data">
                    <div className="groupbox">
                        <table>
                            <tr>
                                <th><label htmlFor="frm-jobSetup-setupForm-code">Enter PDB ID code</label>:</th>
                                <td><input type="text" name="code" maxLength={4} size={10} className="text" id="frm-jobSetup-setupForm-code" value="1tqn" />
                                    <div className="hint">PDB ID code as can be found on www.pdb.org, for example 1z10.</div></td></tr>
                                    
                            <tr>
                                <th><label htmlFor="frm-jobSetup-setupForm-unit">and optional Unit</label>:</th>
                                <td><input type="text" name="unit" maxLength={2} size={10} className="text" id="frm-jobSetup-setupForm-unit" value="" />
                                    <div className="hint">
                                        no value - assymetric unit (default)<br/>
                                        1 - biological unit 1,<br/>
                                        (2 - biological unit 2, etc. )
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th><label htmlFor="frm-jobSetup-setupForm-chains">and optional chain(s)</label>:</th>
                                <td><input type="text" name="chains" maxLength={20} size={10} className="text" id="frm-jobSetup-setupForm-chains" value=""/>
                                    <div className="hint">
                                        no value - all chains (default)<br/>
                                        AB1 - only chains A, B and 1
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <th><label htmlFor="frm-jobSetup-setupForm-file">or upload your own file</label>:</th>
                                <td>
                                    <input type="file" name="file" className="text" id="frm-jobSetup-setupForm-file" />
                                    <div className="hint">
                                        Plain text PDB files (UTF-8 encoding), ZIP and GZIP archives are supported,
                                        maximal file size is 50MB.<br/>
                                        E.g. cleaned PDB with only one chain and without unnecessary HETATMs.
                                    </div>
                                </td>
                            </tr>
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
namespace DownloadReport.UI{

    import React = LiteMol.Plugin.React
    import LiteMoleEvent = LiteMol.Bootstrap.Event;

    declare class jsPDF{
        constructor(unitSize:string, unit:string, params:any);
        constructor();
        addSVG(svg:any, leftMargin:number,rightMargin:number,w:number, h:number):any;
        addImage(img:any,type:string,x:number,y:number,width:number,height:number):any;
        output(type:string,params?:string):string;
        setProperties(props:any):any
        rect(x:number, y:number, w:number, h:number, style:string|null):any
        setFontSize(size:number):any
        text(text:string|string[], x:number, y:number, flags?:Object):any
        lines(lines:number[][], x:number, y:number, scale?:any, style?:string, closed?:boolean):any
        setDrawColor(ch1:string, ch2?:string, ch3?:string, ch4?:string):any
        setLineWidth(width:number):any
        addPage():any
    };

    declare function html2canvas(html:HTMLElement,options?:any):Promise<HTMLCanvasElement>;

    declare function html2pdf(html:HTMLElement|string, pdf:jsPDF, hndl?:(pdf:jsPDF)=>void):void;
    declare function $(p:any): any;

    export function render(target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App />, target);
    }

    export class App extends React.Component<{}, {}> {

        componentDidMount(){
        }

        componentWillUnmount(){
        }

        render() {
            return <div>
                <DownloadResultsMenu />
            </div>
        }
    }  

    class BootstrapDropDownMenuItem extends React.Component<{link: string, linkText:string, targetBlank: boolean},{}>{
        render(){
            return(
                <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkText}</a></li>
            );
        }
    }

    class BootstrapDropDownMenuElementItem extends React.Component<{link: string, linkElement:JSX.Element, targetBlank: boolean},{}>{
        render(){
            return(
                <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkElement}</a></li>
            );
        }
    }

    class BootstrapDropDownMenuButton extends React.Component<{label: string, items: JSX.Element[]},{}>{
        render(){
            return <div className="btn-group dropdown">
                    <button type="button" className="download dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        {this.props.label} <span className="glyphicon glyphicon-download"></span>
                    </button>
                    <ul className="dropdown-menu">
                        {this.props.items}
                    </ul>
                </div>
        }
    }

    interface PDFWithYPos{
        pdf: jsPDF,
        y: number
    };
    interface DownloadPDFReportDropdownMenuItemState{
        data:DataInterface.MoleData|DataInterface.ChannelsDBData|null,
        pdf: jsPDF|null
        y:number
    }
    class DownloadPDFReportDropdownMenuItem extends React.Component<{linkText:string},DownloadPDFReportDropdownMenuItemState>{
        private a4width = 210;
        private a4height = 297;
        private lineColor = "0.7";
        private lineWidth = 0.3;

        public static templateCache:string|null = null;

        state:DownloadPDFReportDropdownMenuItemState = {data:null,pdf:null,y:0};

        componentDidMount(){
            MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(data=>{
                console.log("DATA loaded!!!");
                let state = this.state;
                state.data = data;
                this.setState(state);
            });
        }

        private getMMByPercent(percent:number,horizontal:boolean){
            let p;
            if(horizontal){
                p = this.a4width/100;
            }
            else{
                p = this.a4height/100;
            }

            return p*percent;
        }

        private addCurrentLMScreen(template:string){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let litemolCanvas = (plugin.context.scene.scene.parentElement.children[0] as HTMLCanvasElement);
            let litemol_screenshot = litemolCanvas.toDataURL('image/png');
            template = template.replace("<!--3D-SCREEN-SRC-->",litemol_screenshot);
            return template.replace("<!--report-3D-view-visible-->","visible");
        }

        private addCurrentLVZScreen(template:string){
            let lvz = (MoleOnlineWebUI.Bridge.Instances.getLayersVizualizer() as LayersVizualizer.Vizualizer);
            let screenshot = lvz.exportImage();
            template = template.replace("<!--2D-SCREEN-SRC-->",screenshot);
            return template.replace("<!--report-2D-view-visible-->","visible");
        }
        
        private addHTML(pdf:jsPDF, html:HTMLElement, y:number){
            return new Promise<PDFWithYPos>((res,rej)=>{
                try{
                    html2canvas(html,{dpi:900}).then((canvas)=>{
                        let origWidth = canvas.width;
                        let origHeight = canvas.height;
                        let ratio = origWidth/origHeight;
                        let screenshot = canvas.toDataURL();
                        let x = 0;
                        let w = this.getMMByPercent(100,true);
                        let h = w/ratio;
                        let max_h = this.getMMByPercent(100,false)-y;
                        h = (h>max_h)?max_h:h;
                        //console.log(screenshot);
                        pdf.addImage(screenshot,"PNG",x,y,w,h);
                        res({pdf,y:y+h});
                    });
                }catch(err){
                    rej(err);
                }
            });
        }

        private addTunnelName(template:string, text:string):string{
            return template.replace("<!--TUNNEL-NAME-->",text);
        }

        private addLiningResidues(template:string, residues:string[]){
                    let rows = "";
                    for(let i=0;i<residues.length;i++){
                        let resInfo = CommonUtils.Residues.parseResidues([residues[i]],true);
                        let name = resInfo[0].name;
                        let seq = resInfo[0].authSeqNumber;
                        let chain = resInfo[0].chain.authAsymId;
                        let backbone = (resInfo[0].backbone)?'<div class="report-ok-icon"/>':'';
                        let annotation = ''; //TODO: add annotations
                        rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td>${annotation}</td></tr>`;
                    }
                    return template.replace("<!--LINING-RESIDUES-TABLE-ROWS-->",rows);    
        }

        private selectChannel(channel:DataInterface.Tunnel){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let entity = plugin.context.select((channel as any).__id)[0];
            if(entity === void 0 || entity.ref === "undefined"){
                LiteMol.Example.Channels.State.showChannelVisuals(plugin,[channel as any],true);
                window.setTimeout(()=>{
                    this.selectChannel(channel);
                },10)
                return;
            }
            let channelRef = entity.ref;
            
            plugin.command(LiteMol.Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
            plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, LiteMol.Bootstrap.Interactivity.Info.selection(entity, [0]));
        }

        private generateChannelReport(channelData:DataInterface.Tunnel){
            return new Promise<any>((res,rej)=>{
                let template = DownloadPDFReportDropdownMenuItem.templateCache;
                if(template===null){
                    rej("No template!!!");
                    return;
                }
                let notNullTemplate = template.slice();

                let templateInstance = notNullTemplate.slice();

                let residues = CommonUtils.Residues.sort(channelData.Layers.ResidueFlow.slice(),void 0, true, true);
                //console.log(residues);
                if(residues===void 0){
                    return;
                }

                let tunnelName = "Error";
                let name_ = CommonUtils.Tunnels.getName(channelData);
                if(name_!==void 0){
                    tunnelName = name_;
                }
                console.log(tunnelName);
                templateInstance = this.addTunnelName(templateInstance,tunnelName);
                templateInstance = this.addCurrentLMScreen(templateInstance);
                templateInstance = this.addCurrentLVZScreen(templateInstance);
                templateInstance = this.addLiningResidues(templateInstance,residues.slice(0,19));

                let html = $(templateInstance)[0];
                document.body.appendChild(html);
                let state = this.state;
                let pdf;
                if(state.pdf===null){
                    pdf = new jsPDF();
                }
                else{
                    pdf = state.pdf;
                }

                this.addHTML(pdf,html,0).then(info=>{
                    //info.pdf.output("save","Report.pdf");
                    document.body.removeChild(html);

                    if(residues.length>19){
                        console.log("residues>19");
                        let templInst = notNullTemplate.slice();
                        templInst = this.addTunnelName(templInst,tunnelName);
                        templInst = this.addLiningResidues(templInst,residues.slice(19));
                        let nHtml = $(templInst)[0];
                        document.body.appendChild(nHtml);
                        info.pdf.addPage();
                        console.log("about to add next page of residues");
                        this.addHTML(info.pdf,nHtml,0).then(info=>{
                            document.body.removeChild(nHtml);
                            let state = this.state;
                            state.pdf = info.pdf;
                            this.setState(state);
                            res();
                        });
                    }
                    else{
                        let state = this.state;
                        state.pdf = info.pdf;
                        this.setState(state);
                        res();
                    }
                });
            });
        }



        private generateChannelReportWrapper(channelData:DataInterface.Tunnel){
            return new Promise<void>((res,rej)=>{
                if(this.state.data===null){
                    rej("No data!");
                }
                let selectedChannelId = CommonUtils.Selection.SelectionHelper.getSelectedChannelId();
                let canvas = $(".layer-vizualizer-canvas");
                //console.log(selectedChannelId);
                if(canvas.length===0||selectedChannelId!==channelData.Id){
                    if(selectedChannelId!==channelData.Id){
                        this.selectChannel(channelData);
                    }
                    window.setTimeout(()=>{
                        this.generateChannelReportWrapper(channelData)
                            .then(()=>{
                                res();
                            })
                            .catch(err=>console.log(err))
                    },100);
                    return;
                }
                
                this.generateChannelReport(channelData).then(
                    ()=>res()
                );
            });
        }

        private generateReport(){
            MoleOnlineWebUI.Service.Templates.Service.getPDFReportTemplateData().then(template=>{
            DownloadPDFReportDropdownMenuItem.templateCache = template;
            if(this.state.data===null){
                console.log("genereateReport has no data!");
                return;
            }
            let data = this.state.data.Channels as any;

            let channels:DataInterface.Tunnel[] = [];
            //-- MoleOnline
            if(data.MergedPores && data.MergedPores.length > 0){
                channels = data.MergedPores;
            }
            if(data.Paths && data.Paths.length > 0){
                channels = data.Paths;
            }
            if(data.Pores && data.Pores.length > 0){
                channels = data.Pores;
            }
            if(data.Tunnels && data.Tunnels.length > 0){
                channels = data.Tunnels;
            }
            //-- ChannelsDB
            if(data.ReviewedChannels && data.ReviewedChannels.length > 0){
                channels = data.ReviewedChannels;
            }
            if(data.CSATunnels && data.CSATunnels.length > 0){
                channels = data.CSATunnels;
            }
            if(data.TransmembranePores && data.TransmembranePores.length > 0){
                channels = data.TransmembranePores;
            }
            if(data.ReviewedChannels && data.ReviewedChannels.length > 0){
                channels = data.ReviewedChannels;
            }

            // create a new jsPDF instance
            let pdf = new jsPDF();
            let state = this.state;
            state.pdf = pdf;
            this.setState(state);

            let split = (tunnels:DataInterface.Tunnel[])=>{
                if(tunnels.length===0){
                    return {
                        current:null,
                        remaining: []
                    };
                }
                
                return {
                    current: tunnels[0],
                    remaining: tunnels.slice(1)
                }
            }

            let generate = (tunnels:DataInterface.Tunnel[])=>{
                let d = split(tunnels);
                if(d.current===null){
                    console.log("Saving file...");
                    if(this.state.pdf!==null){
                        this.state.pdf.output("save","Report.pdf");
                    }
                    return;
                }
                this.generateChannelReportWrapper(d.current).then(res=>{
                    let tunnelId = (d.current===null)?"<Err>":d.current.Id;
                    console.log(`Current tunnel: ${tunnelId}`);
                    console.log(`${d.remaining.length} tunnels remaining of ${channels.length}`);
                    if(d.remaining.length>0){
                        let pdf_ = this.state.pdf;
                        if(pdf_!==null){
                            pdf_.addPage();
                            let s = this.state;
                            s.pdf = pdf_;
                            this.setState(s);
                        }
                    }
                    generate(d.remaining);
                })
                .catch(err=>console.log(err));
            };

            generate(channels);
            
            });
            
        }
        
        render(){
            return(
                <li><a onClick={(()=>{this.generateReport()}).bind(this)}>{this.props.linkText}</a></li>
            );
        }
    }

    interface DownloadResultsMenuState{
        computationId:string,
        submitId:number
    }
    class DownloadResultsMenu extends React.Component<{},DownloadResultsMenuState>{
        state = {computationId:"",submitId:0}

        componentDidMount(){
            let params = CommonUtils.Router.getParameters();
            if(params!==null){
                let computationId = params.computationId;
                let submitId = params.submitId;
                this.setState({computationId,submitId});    
            }

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                let state = this.state;
                state.submitId = submitId;
                this.setState(state);
            });
        }
        
        render(){                       
            let computationId = this.state.computationId;
            let submitId = `?submitId=${this.state.submitId}`;
            
            let linkBase = `${Config.DataSources.API_URL[Config.DataSources.MODE]}/Data/${computationId}${submitId}`;
            
            let items:JSX.Element[] = [];
        
            if(computationId!==void 0){
                items.push(
                    <BootstrapDropDownMenuItem linkText="Molecule" link={`${linkBase}&format=molecule`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="PyMol" link={`${linkBase}&format=pymol`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="VMD" link={`${linkBase}&format=vmd`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDB" link={`${linkBase}&format=pdb`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Chimera" link={`${linkBase}&format=chimera`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="JSON" link={`${linkBase}`} targetBlank={true} />
                );
                items.push(
                    <BootstrapDropDownMenuItem linkText="Report" link={`${linkBase}&format=report`} targetBlank={true} />
                );
                //TODO: viz TODO_MOLEONLINE
                /*
                items.push(
                    <DownloadPDFReportDropdownMenuItem linkText="PDF report" />
                );*/
            }
            return <BootstrapDropDownMenuButton label="Download report" items={items} />
        }
    }
}
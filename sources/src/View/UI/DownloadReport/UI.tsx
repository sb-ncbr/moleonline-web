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

    class BootstrapDropDownMenuItem extends React.Component<{link?: string, linkText:string, targetBlank?: boolean, onClick?:()=>void},{}>{
        render(){
            if(this.props.onClick!==void 0){
                return(
                    <li><a onClick={this.props.onClick}>{this.props.linkText}</a></li>
                );    
            }
            else{
                return(
                    <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkText}</a></li>
                );
            }
        }
    }

    class BootstrapDropDownMenuElementItem extends React.Component<{link?: string, linkElement:JSX.Element, targetBlank?: boolean, onClick?:()=>void},{}>{
        render(){
            if(this.props.onClick!==void 0){
                return(
                    <li><a onClick={this.props.onClick}>{this.props.linkElement}</a></li>
                );    
            }
            else{
                return(
                    <li><a target={(this.props.targetBlank)?"_blank":""} href={this.props.link}>{this.props.linkElement}</a></li>
                );
            }
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
/*
    interface DownloadPDFReportDropdownMenuItemState{
        data:DataInterface.MoleData|DataInterface.ChannelsDBData|null,
        reportContent: string|null
        inProgress:boolean,
        progress:number
    }
    class DownloadPDFReportDropdownMenuItem extends React.Component<{linkText:string},DownloadPDFReportDropdownMenuItemState>{
        private a4width = 210;
        private a4height = 297;
        private lineColor = "0.7";
        private lineWidth = 0.3;

        public static templateCache:MoleOnlineWebUI.Service.Templates.PDFTemplate|null = null;

        state:DownloadPDFReportDropdownMenuItemState = {data:null,reportContent:null,inProgress:false,progress:0};

        componentDidMount(){
            MoleOnlineWebUI.Bridge.Events.subscribeChannelDataLoaded(data=>{
                let state = this.state;
                state.data = data;
                this.setState(state);
            });
        }

        private addCurrentLMScreen(template:string){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            let litemolCanvas = (plugin.context.scene.scene.parentElement.children[0] as HTMLCanvasElement);
            let litemol_screenshot = litemolCanvas.toDataURL('image/png');
            template = template.replace("[[3D-SCREEN-SRC]]",litemol_screenshot);
            return template.replace("[[report-3D-view-visible]]","visible");
        }

        private addCurrentLVZScreen(template:string){
            let lvz = (MoleOnlineWebUI.Bridge.Instances.getLayersVizualizer() as LayersVizualizer.Vizualizer);
            let screenshot = lvz.exportImage();
            template = template.replace("[[2D-SCREEN-SRC]]",screenshot);
            return template.replace("[[report-2D-view-visible]]","visible");
        }

        private addTunnelName(template:string, text:string):string{
            return template.replace("[[TUNNEL-NAME]]",text);
        }

        private addLiningResidues(template:string, residueLines:{residue: string,annotation: MoleOnlineWebUI.Service.ChannelsDBAPI.ResidueAnnotation | null}[]){
                    let rows = "";
                    for(let i=0;i<residueLines.length;i++){
                        let resInfo = CommonUtils.Residues.parseResidues([residueLines[i].residue],true);
                        let name = resInfo[0].name;
                        let seq = resInfo[0].authSeqNumber;
                        let chain = resInfo[0].chain.authAsymId;
                        let backbone = (resInfo[0].backbone)?'<img class="report-ok-icon" src="/assets/images/accept.gif"/>':'';                        
                        let annotation = residueLines[i].annotation;
                        if(annotation===null){
                            rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td></td></tr>`;    
                        }
                        else{
                            rows += `<tr><td>${name}</td><td>${seq}</td><td>${chain}</td><td>${backbone}</td><td>${annotation.text} ${((annotation.reference!=="")?"("+annotation.reference+")":"")}</td></tr>`;
                        }
                    }
                    return template.replace("[[LINING-RESIDUES-TABLE-ROWS]]",rows);    
        }

        private selectChannel(channel:DataInterface.Tunnel, allChannels:DataInterface.Tunnel[]){
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            return new Promise<any>((res,rej)=>{
                try{
                    LiteMol.Example.Channels.State.showChannelVisuals(plugin,allChannels as any,false).then(()=>{
                        MoleOnlineWebUI.Bridge.Events.invokeChannelSelect(channel.Id);
                        
                        let waitToResolve = ()=>{
                            window.setTimeout(()=>{
                                if(CommonUtils.Selection.SelectionHelper.getSelectedChannelId()==channel.Id){
                                    window.setTimeout(()=>{res()},100);
                                    return;
                                }
                                waitToResolve();
                            },20);
                        };
                        waitToResolve();
                    })
                }catch(err){
                    rej(err);
                }
            });
        }

        private zipResiduesWithAnnotations(residues:string[],annotations:Map<string, MoleOnlineWebUI.Service.ChannelsDBAPI.ResidueAnnotation[]> | null):{residue:string,annotation:MoleOnlineWebUI.Service.ChannelsDBAPI.ResidueAnnotation|null}[]{
            let result:{residue:string, annotation:MoleOnlineWebUI.Service.ChannelsDBAPI.ResidueAnnotation|null}[] = [];
            
            for(let r of residues){
                if(annotations===null){
                    result.push({residue:r,annotation:null});
                    continue;
                }
                let info = CommonUtils.Residues.parseResidues([r],true);
                let a = annotations.get(`${info[0].authSeqNumber} ${info[0].chain.authAsymId}`);
                if(a===void 0||a===null||a.length===0){
                    result.push({residue:r,annotation:null});
                    continue;
                }
                for(let ca of a){
                    result.push({residue:r,annotation:ca});
                }
            }

            return result;
        }

        private generateChannelReport(channelData:DataInterface.Tunnel){
            return new Promise<any>((res,rej)=>{
                let template = DownloadPDFReportDropdownMenuItem.templateCache;
                if(template===null){
                    rej("No template!!!");
                    return;
                }
                let notNullTemplate = template.html.slice();

                let templateInstance = notNullTemplate.slice();

                let residues = CommonUtils.Residues.sort(channelData.Layers.ResidueFlow.slice(),void 0, true, true);
                if(residues===void 0){
                    return;
                }

                let name_ = CommonUtils.Tunnels.getName(channelData);
                let chdb_annotations = MoleOnlineWebUI.Cache.ChannelsDBData.getChannelAnnotationsImmediate(channelData.Id);
                let length = CommonUtils.Tunnels.getLength(channelData);
                let tunnelName = `${channelData.Type}, Length: ${length} Å`;
                if(chdb_annotations!==null&&chdb_annotations.length>0){
                    tunnelName = chdb_annotations[0].name;                    
                }
                else if(name_!==void 0){
                    tunnelName = name_;
                }
                
                let residueAnnotations = MoleOnlineWebUI.Cache.ChannelsDBData.getResiduesAnnotationsImmediate();
                let residuesPages = this.zipResiduesWithAnnotations(residues,residueAnnotations);
                let residuesList:{residue: string, annotation: MoleOnlineWebUI.Service.ChannelsDBAPI.ResidueAnnotation | null }[] = [];
                for(let p of residuesPages){
                    residuesList = residuesList.concat(p);
                }

                templateInstance = this.addTunnelName(templateInstance,tunnelName);
                templateInstance = this.addCurrentLMScreen(templateInstance);
                templateInstance = this.addCurrentLVZScreen(templateInstance);
                templateInstance = this.addLiningResidues(templateInstance,residuesList);

                let state = this.state;
                let reportContent="";
                if(state.reportContent!==null){
                    reportContent = state.reportContent;
                }

                reportContent += templateInstance;
                state.reportContent = reportContent;
                this.setState(state);
                res();
            });
        }

        private generateChannelReportWrapper(channelData:DataInterface.Tunnel, allChannels:DataInterface.Tunnel[]){
            return new Promise<void>((res,rej)=>{
                if(this.state.data===null){
                    rej("No data!");
                }
                let selectedChannelId = CommonUtils.Selection.SelectionHelper.getSelectedChannelId();
                let canvas = $(".layer-vizualizer-canvas");
                if(canvas.length===0||selectedChannelId!==channelData.Id){
                    if(selectedChannelId!==channelData.Id){
                        this.selectChannel(channelData,allChannels).then(()=>{
                            this.generateChannelReportWrapper(channelData, allChannels)
                            .then(()=>{
                                res();
                            })
                            .catch(err=>{
                                rej(err)
                                console.log(err);
                            });
                        });
                    }
                    else{
                        let waitForCanvas = (timeout?:number)=>{
                            let canvas = $(".layer-vizualizer-canvas");
                            if(canvas.length===0){
                                window.setTimeout(()=>waitForCanvas((timeout===void 0)?20:timeout+10),(timeout===void 0)?20:timeout);
                            }
                            else{
                                this.generateChannelReport(channelData)
                                .then(
                                    ()=>res()
                                ).catch(err=>{
                                    rej(err)
                                    console.log(err);
                                });
                                res();
                            }
                        };
                        waitForCanvas();
                    }
                }
                else{
                    this.generateChannelReport(channelData).then(
                        ()=>res()
                    ).catch(err=>{
                        rej(err)
                        console.log(err);
                    });
                }
            });
        }

        private replacePlaceholder(template:string,placeholder:string,value:string|null){
            let regexp = new RegExp("\\[\\["+placeholder+"\\]\\]","g");
            return template.replace(regexp,(value===null)?"":value);   
        }

        private addParamsPageCommon(template:string, urlParams:CommonUtils.Router.URLParams|null){
            let emptyPlaceholders:string[] = [];
            if(urlParams!==null){
                template = this.replacePlaceholder(template, "COMP-ID",urlParams.computationId);
                template = this.replacePlaceholder(template, "SUBMIT-ID",String(urlParams.submitId));
            }
            else{
                emptyPlaceholders.push("COMP-ID");
                emptyPlaceholders.push("SUBMIT-ID");
            }
            template = this.replacePlaceholder(template, "URL",CommonUtils.Router.getCurrentUrl());

            template = this.replaceEmptyPlaceholders(template,emptyPlaceholders);

            return template;
        }

        //Replace all not filled placeholders with empty strings
        private replaceEmptyPlaceholders(template:string, placeholders:string[]){
            for(let emptyPlaceholder of placeholders){
                template = this.replacePlaceholder(template, emptyPlaceholder,""); 
            }

            return template;
        }

        private addParamsPageMole(template:string, params:MoleOnlineWebUI.Service.MoleAPI.MoleConfig){
            template = this.replacePlaceholder(template, "MOLE-PARAMS-VISIBLE","visible");
            let emptyPlaceholders:string[] = [];
            let input = params.Input;
            let cavity = params.Cavity;
            let exits = params.CustomExits;
            let nonactiveResidues = params.NonActiveResidues;
            let origin = params.Origin;
            let tunnel = params.Tunnel;
            if(input!==void 0){
                template = this.replacePlaceholder(template, "READ-ALL-MODELS",(input.ReadAllModels)?"Yes":"No");
                template = this.replacePlaceholder(template, "SPECIFIC-CHAINS",input.SpecificChains);
            }
            else{
                emptyPlaceholders.push("READ-ALL-MODELS");
                emptyPlaceholders.push("SPECIFIC-CHAINS");
            }
            if(cavity!==void 0){
                template = this.replacePlaceholder(template, "IGNORE-HYDROGENS",(cavity.IgnoreHydrogens)?"Yes":"No");
                template = this.replacePlaceholder(template, "IGNORE-HETATMS",(cavity.IgnoreHETAtoms)?"Yes":"No");
                template = this.replacePlaceholder(template, "INTERIOR-TRESHOLD",String(cavity.InteriorThreshold));
                template = this.replacePlaceholder(template, "PROBE-RADIUS",String(cavity.ProbeRadius));
            }
            else{
                emptyPlaceholders.push("IGNORE-HYDROGENS");
                emptyPlaceholders.push("IGNORE-HETATMS");
                emptyPlaceholders.push("INTERIOR-TRESHOLD");
                emptyPlaceholders.push("PROBE-RADIUS");
            }
            if(origin!==void 0&&origin!==null){
                let points = origin.Points;
                if(points!==null){
                    template = this.replacePlaceholder(template, "STARTING-POINT-XYZ",CommonUtils.Misc.pointsToString(points));    
                }
                else{
                    emptyPlaceholders.push("STARTING-POINT-XYZ");    
                }
                let residues = origin.Residues;
                if(residues!==null){
                    template = this.replacePlaceholder(template, "STARTING-POINT",CommonUtils.Misc.flattenResiduesArray(residues));    
                }
                else{
                    emptyPlaceholders.push("STARTING-POINT");    
                }
                if(origin.QueryExpression!==null){
                    template = this.replacePlaceholder(template, "QUERY-FILTER",origin.QueryExpression);
                }
                else{
                    emptyPlaceholders.push("QUERY-FILTER");    
                }
            }
            else{
                emptyPlaceholders.push("STARTING-POINT-XYZ");
                emptyPlaceholders.push("STARTING-POINT");
                emptyPlaceholders.push("QUERY-FILTER");
            }
            if(exits!==void 0&&exits!==null){
                let points = exits.Points;
                if(points!==null){
                    template = this.replacePlaceholder(template, "END-POINT-XYZ",CommonUtils.Misc.pointsToString(points));  
                }
                else{
                    emptyPlaceholders.push("END-POINT-XYZ");
                }
                let residues = exits.Residues;
                if(residues!==null){
                    template = this.replacePlaceholder(template, "END-POINT",CommonUtils.Misc.flattenResiduesArray(residues));  
                }
                else{
                    emptyPlaceholders.push("END-POINT");
                }
                if(exits.QueryExpression!==null){
                    template = this.replacePlaceholder(template, "QUERY",exits.QueryExpression);  
                }
                else{
                    emptyPlaceholders.push("QUERY");
                }
            }
            else{
                emptyPlaceholders.push("END-POINT-XYZ");
                emptyPlaceholders.push("END-POINT");
                emptyPlaceholders.push("QUERY");
            }
            if(nonactiveResidues!==void 0&&nonactiveResidues!==null){
                template = this.replacePlaceholder(template, "IGNORED-RESIDUES",CommonUtils.Misc.flattenResidues(nonactiveResidues));  
            }
            else{
                emptyPlaceholders.push("IGNORED-RESIDUES");
            }
            if(tunnel!==void 0&&tunnel!==null){
                template = this.replacePlaceholder(template, "BOTTLENECK-RADIUS",String(tunnel.BottleneckRadius));                  
                template = this.replacePlaceholder(template, "BOTTLENECK-TOLERANCE",String(tunnel.BottleneckTolerance));
                template = this.replacePlaceholder(template, "MAX-TUNNEL-SIMILARITY",String(tunnel.MaxTunnelSimilarity));
                template = this.replacePlaceholder(template, "ORIGIN-RADIUS",String(tunnel.OriginRadius));
                template = this.replacePlaceholder(template, "SURFACE-COVER-RADIUS",String(tunnel.SurfaceCoverRadius));
                template = this.replacePlaceholder(template, "WEIGHT-FUNCTION",String(tunnel.WeightFunction));
            }
            else{
                emptyPlaceholders.push("BOTTLENECK-RADIUS");
                emptyPlaceholders.push("BOTTLENECK-TOLERANCE");
                emptyPlaceholders.push("MAX-TUNNEL-SIMILARITY");
                emptyPlaceholders.push("ORIGIN-RADIUS");
                emptyPlaceholders.push("SURFACE-COVER-RADIUS");
                emptyPlaceholders.push("WEIGHT-FUNCTION");
            }
            if(params.PoresAuto!==void 0){
                template = this.replacePlaceholder(template, "AUTOMATIC-PORES",(params.PoresAuto)?"Yes":"No"); 
            }
            else{
                emptyPlaceholders.push("AUTOMATIC-PORES");
            }
            if(params.PoresMerged!==void 0){
                template = this.replacePlaceholder(template, "MERGE-PORES",(params.PoresMerged)?"Yes":"No"); 
            }
            else{
                emptyPlaceholders.push("MERGE-PORES");
            }

            template = this.replaceEmptyPlaceholders(template,emptyPlaceholders);

            return template;
        }
        
        private addParamsPagePores(template:string, params:MoleOnlineWebUI.Service.MoleAPI.PoresConfig){
            template = this.replacePlaceholder(template, "PORES-PARAMS-VISIBLE","visible");
            template = this.replacePlaceholder(template, "BETA-STRUCTURE",(params.IsBetaBarel)?"Yes":"No");
            template = this.replacePlaceholder(template, "MEMBRANE-REGION",(params.IsBetaBarel)?"Yes":"No");
            template = this.replacePlaceholder(template, "SPECIFIC-CHAINS",params.Chains);

            return template;
        }

        private generateReport(){
            let urlParams = CommonUtils.Router.getParameters();
            if(urlParams===null){
                console.log("URL parameters cannot be parsed!");
                return;
            }
            $("#download-report .dropdown").addClass("open-programaticaly");
            let state = this.state;
            state.inProgress = true;
            this.setState(state);

            let channelsDBMode = CommonUtils.Router.isInChannelsDBMode();
            let configParamsPromise;
            if(channelsDBMode){
                configParamsPromise = Promise.resolve(null as MoleOnlineWebUI.Service.MoleAPI.Submission|null);
            }
            else{
                configParamsPromise = new Promise<MoleOnlineWebUI.Service.MoleAPI.Submission|null>((res,rej)=>{
                    if(urlParams===null){
                        rej("URL parameters cannot be parsed");
                        return;
                    }
                    MoleOnlineWebUI.DataProxy.ComputationInfo.DataProvider.get(urlParams.computationId,(compId,info)=>{
                        if(urlParams===null){
                            rej("URL parameters cannot be parsed");
                        }
                        else{
                            if(compId===urlParams.computationId){
                                for(let s of info.Submissions){
                                    if(String(s.SubmitId)===String(urlParams.submitId)){
                                        res(s);
                                        return;
                                    }
                                }
                                rej("Submission data not available!");
                            }
                        }
                    });
                });
            }

            configParamsPromise.then((val)=>{
                let originalVisibleChannels = MoleOnlineWebUI.Cache.LastVisibleChannels.get();
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

                    let reportContent = "";

                    if(!channelsDBMode&&val!==null){
                        let modeMole = CommonUtils.Misc.isMoleJob(val);
                        let paramsPageTemplate = template.paramsPageHtml.slice();
                        paramsPageTemplate = this.addParamsPageCommon(paramsPageTemplate,urlParams);

                        if(modeMole){
                            paramsPageTemplate = this.addParamsPageMole(paramsPageTemplate,val.MoleConfig);
                        }
                        else{
                            paramsPageTemplate = this.addParamsPagePores(paramsPageTemplate,val.PoresConfig);
                        }
                        reportContent += paramsPageTemplate;
                    }

                    let state = this.state;
                    state.reportContent = reportContent;
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
                            if(Config.CommonOptions.DEBUG_MODE)
                                console.log("Saving file...");
                            if(this.state.reportContent!==null&&DownloadPDFReportDropdownMenuItem.templateCache!==null){
                                let css = '<style>'+DownloadPDFReportDropdownMenuItem.templateCache.css+"</style>";
                                let reportWrapperId = "report-wrapper";
                                let jsConstants = `<script>var report_idToRemoveAfterPrint = '${reportWrapperId}';</script>`;
                                let toPrint = `<div id='${reportWrapperId}'>`+css+this.state.reportContent+'</div>';
                                let toPrintHtml = $(toPrint)[0];
                                $(document.body.children).addClass("no-print");
                                document.body.appendChild(toPrintHtml);
                                let originalTitle = document.title;
                                
                                if(urlParams!==null){
                                    document.title = `MoleOnline - ${urlParams.computationId}/${urlParams.submitId}`;
                                }

                                window.setTimeout(()=>{                        
                                    let afterPrint = (()=>{
                                        let reportWrapper = $('#'+reportWrapperId)[0];
                                        if(reportWrapper!==void 0&&reportWrapper!==null){
                                            document.body.removeChild(reportWrapper);
                                        }
                                        $(document.body.children).removeClass("no-print");
                                        $("#download-report .dropdown").removeClass("open-programaticaly");
                                        let state = this.state;
                                        state.progress = 0;
                                        state.inProgress = false;
                                        this.setState(state);
                                        document.title = originalTitle;
                                
                                    }).bind(this);
                                
                                    if (window.matchMedia) {
                                        let mediaQueryList = window.matchMedia('print');
                                        mediaQueryList.addListener(function(mql) {
                                            if (!mql.matches) {
                                                afterPrint();
                                            }
                                        });
                                    }
                                
                                    window.onafterprint = afterPrint;

                                    let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();

                                    LiteMol.Example.Channels.State.showChannelVisuals(plugin,channels as any,false).then(()=>{
                                        LiteMol.Example.Channels.State.showChannelVisuals(plugin,originalVisibleChannels as any,true).then(()=>{
                                            CommonUtils.Selection.SelectionHelper.resetScene(plugin);
                                            CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
                                            CommonUtils.Selection.SelectionHelper.forceInvokeOnChannelDeselectHandlers();
                                            window.print();
                                        });
                                    });
                                });
                            }
                            return;
                        }
                        this.generateChannelReportWrapper(d.current,channels).then(res=>{
                            let tunnelId = (d.current===null)?"<Err>":d.current.Id;
                            if(Config.CommonOptions.DEBUG_MODE){
                                console.log(`Current tunnel: ${tunnelId}`);
                                console.log(`${d.remaining.length} tunnels remaining of ${channels.length}`);
                            }
                            let s = this.state;
                            s.progress = Math.floor(((channels.length-d.remaining.length)/channels.length)*100);
                            this.setState(s);
                            generate(d.remaining);
                        })
                        .catch(err=>{
                            this.afterError(err);
                        });
                    };

                    generate(channels);
                
                }).catch(err=>{
                    this.afterError(err);    
                });
            })
            .catch(err=>{
                this.afterError(err);
            });
        }
        
        private afterError(err:any){
            $(document.body.children).removeClass("no-print");
            $("#download-report .dropdown").removeClass("open-programaticaly");
            let state = this.state;
            state.progress = 0;
            state.inProgress = false;
            this.setState(state);
            MoleOnlineWebUI.Bridge.Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `PDF Report generation aborted. Reason: ${err}`
            })
        }

        render(){
            if(this.state.inProgress){
                let progress = this.state.progress;
                return <li><div className="pdf-report-inprogress-overlay">
                        <img src="/assets/images/ajax-loader.gif"/>
                        <div className="pdf-report-inprogress-progress">Generating PDF report ({progress}%)...</div>
                    </div></li>
            }
            return(
                <li><a onClick={(()=>{this.generateReport()}).bind(this)}>{this.props.linkText}</a></li>
            );
        }
    }*/

    interface DownloadResultsMenuState{
        computationId:string,
        submitId:number
    }
    class DownloadResultsMenu extends React.Component<{},DownloadResultsMenuState>{
        state = {computationId:"",submitId:0}

        componentDidMount(){
            let params = Common.Util.Router.getParameters();
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
                    <BootstrapDropDownMenuItem linkText="Results" link={`${linkBase}&format=report`} targetBlank={true} />
                );                
                items.push(
                    <BootstrapDropDownMenuItem linkText="PDF report" onClick={()=>{MoleOnlineWebUI.Bridge.Events.invokeRunPDFReport();}}/>
                );
            }
            return <BootstrapDropDownMenuButton label="Download report" items={items} />
        }
    }
}
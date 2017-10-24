/*
 * Copyright (c) 2016 - now David Sehnal, licensed under Apache 2.0, See LICENSE file for more info.
 */

namespace LiteMol.Example.Channels.UI {

    declare function $(p:any): any;

    import React = LiteMol.Plugin.React
    import Transformer = LiteMol.Bootstrap.Entity.Transformer;

    export function render(plugin: Plugin.Controller, target: Element) {
        LiteMol.Plugin.ReactDOM.render(<App plugin={plugin} />, target);
    }

    export class App extends React.Component<{ plugin: Plugin.Controller }, { isLoading?: boolean, error?: string, data?: any, isWaitingForData?: boolean }> {

        state = { isLoading: false, data: void 0, error: void 0 };

        private currentProteinId:string;

        componentDidMount() {
            this.load();
            $(window).on("contentResize", this.onContentResize.bind(this));

            MoleOnlineWebUI.Bridge.Events.subscribeChangeSubmitId((submitId)=>{
                try{
                    this.load();
                }catch(ex){
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log(ex);
                    this.setState({isLoading:false,data: void 0, error:"Data not available"});
                }
            });
        }

        private onContentResize(_:any){
            let prevState = this.props.plugin.context.layout.latestState;
            this.props.plugin.setLayoutState({isExpanded:true});
            this.props.plugin.setLayoutState(prevState);
        }

        load() {
            this.currentProteinId = SimpleRouter.GlobalRouter.getCurrentPid();

            this.setState({ isLoading: true, error: void 0 });      //https://webchem.ncbr.muni.cz/API/ChannelsDB/PDB/1tqn
            State.loadData(this.props.plugin)
                .then(data => {
                    if(Config.CommonOptions.DEBUG_MODE)
                        console.log("loading done ok");
                    let entities = this.props.plugin.context.select("mole-data");
                    if(entities.length===0){
                        let params = CommonUtils.Router.getParameters();
                        if(params === null){
                            this.setState({ isLoading: false, error: `Sorry. Given url is not valid.` });                        
                            return;    
                        }
                        let computationId = params.computationId;
                        let submitId = params.submitId;
                        this.setState({ isLoading: false, error: `There are no vizualization data for computation '${computationId}' and submission '${submitId}'. Try to submit some computation job.` });                        
                        return;
                    }
                    let _data = (entities[0] as Bootstrap.Entity.Data.Json).props.data as DataInterface.MoleData;
                    let csaOrigins = this.props.plugin.context.select("csa-origins");
                    if(csaOrigins.length>0){
                        if((_data as any).Origins===void 0){
                            (_data as any).Origins = {};
                        }
                        
                        (_data as any).Origins.CSAOrigins = (csaOrigins[0] as Bootstrap.Entity.Data.Json).props.data.Origins.CSAOrigins;
                    }

                    if((_data as any).Error !== void 0){
                        this.setState({ isLoading: false, error: (_data as any).Error as string });
                    }
                    else{
                        this.setState({ 
                            isLoading: false, data: _data, error: void 0 
                        });
                    }
                })
                .catch(e => {
                    this.setState({ isLoading: false, error: 'Application was unable to load data. Please try again later.', data: void 0 });
                });
        }

        render() {
            if (this.state.data) {
                return <Data data={this.state.data} plugin={this.props.plugin} />
            } else {
                let controls: any[] = [];

                if (this.state.isLoading) {
                    controls.push(<h1>Loading...</h1>);
                } else {
                    if (this.state.error) {
                        let error = this.state.error as string|undefined;
                        let errorMessage:string = (error===void 0)?"":error;
                        controls.push(
                            <div className="error-message">
                                <div>
                                    <b>Data for specified protein are not available.</b>
                                </div>
                                <div>
                                    <b>Reason:</b> <i dangerouslySetInnerHTML={{__html:errorMessage}}></i>
                                </div>
                            </div>);
                    }
                    controls.push(<button className="reload-data btn btn-primary" onClick={() => this.load()}>Reload Data</button>);
                }

                return <div>{controls}</div>;
            }
        }
    }
    
    export interface State {
        plugin: Plugin.Controller,

        /**
         * This represents the JSON data returned by MOLE.
         * 
         * In a production environment (when using TypeScript),
         * it would be a good idea to write type interfaces for the
         * data to avoid bugs.
         */
        data: any
    }

    export class Data extends React.Component<State, {}> {
        render() {          
            let channels = new Map<String,any>();
            channels.set('Merged pores', (!this.props.data.Channels.MergedPores)?[]:this.props.data.Channels.MergedPores);
            channels.set('Paths', (!this.props.data.Channels.Paths)?[]:this.props.data.Channels.Paths);
            channels.set('Pores', (!this.props.data.Channels.Pores)?[]:this.props.data.Channels.Pores);
            channels.set('Tunnels', (!this.props.data.Channels.Tunnels)?[]:this.props.data.Channels.Tunnels);
            
            let channelsDBChannels = this.props.data.Channels as DataInterface.ChannelsDBChannels;
            channels.set('Reviewed Channels', (!channelsDBChannels.ReviewedChannels)?[]:channelsDBChannels.ReviewedChannels);
            channels.set('CSA Tunnels', (!channelsDBChannels.CSATunnels)?[]:channelsDBChannels.CSATunnels);
            channels.set('Transmembrane Pores', (!channelsDBChannels.TransmembranePores)?[]:channelsDBChannels.TransmembranePores);
            channels.set('Cofactor Tunnels', (!channelsDBChannels.CofactorTunnels)?[]:channelsDBChannels.CofactorTunnels);

            let channelsControls:any[] = [];
            channels.forEach((val,key,map)=>{
                if(val.length>0){
                    channelsControls.push(
                        <Channels channels={val} state={this.props} header={key.valueOf()} />
                    );
                }
            });

            let noChannelsData = <div className="no-channels-data">There are no channels available...</div>
            
            let cavities = new Map<String,any>();
            if(this.props.data.Cavities!==void 0){
                cavities.set('Surface', [this.props.data.Cavities.Surface]);
                cavities.set('Cavities', this.props.data.Cavities.Cavities);
                cavities.set('Voids', this.props.data.Cavities.Voids);
            }

            let cavitiesControls:any[] = [];
            cavities.forEach((val,key,map)=>{
                if(val.length>0){
                    cavitiesControls.push(
                        <Cavities cavities={val} state={this.props} header={key.valueOf()} />
                    );
                }
            });
            let noCavitiesData = <div className="no-channels-data">There are no cavities available...</div>

            let originsControls:any[] = [];
            if(this.props.data.Origins.User!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.User} {...this.props} label='User Specifed (optimized)' />);
            if(this.props.data.Origins.InputOrigins!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.InputOrigins} {...this.props} label='User Specifed' />);
            if(this.props.data.Origins.Computed!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.Computed} {...this.props} label='Computed' />);
            if(this.props.data.Origins.Databse!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.Database} {...this.props} label='Database' />);
            if(this.props.data.Origins.InputExits!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.InputExits} {...this.props} label='Input Exits' />);
            if(this.props.data.Origins.InputFoundExits!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.InputFoundExits} {...this.props} label='Input Found Exits' />);
            if(this.props.data.Origins.CSAOrigins!==void 0)
                originsControls.push(<Origins origins={this.props.data.Origins.CSAOrigins} {...this.props} label='CSA Origins' />);
            
            let noOriginsData = <div className="no-channels-data">There are no origins available...</div>

            return <div>
                <Selection {...this.props} />

                <div className="ui-header">
                    Channels
                </div>
                <div>
                    {(channelsControls.length===0)?noChannelsData:channelsControls}
                </div>

                <div className="ui-header origins">
                    Origins
                </div>
                <div>
                    {(originsControls.length===0)?noOriginsData:originsControls}
                </div>

                <div className="ui-header cavities">
                    Cavities
                </div>
                <div>
                    {(cavitiesControls.length===0)?noCavitiesData:cavitiesControls}
                </div>
            </div>;
        }
    }


    interface ChannelEventInfo { 
        kind: LiteMol.Bootstrap.Interactivity.Info.__Kind.Selection | LiteMol.Bootstrap.Interactivity.Info.__Kind.Empty,
        source : {
            props: {
                tag: {
                    element: DataInterface.Tunnel,
                    type: String
                }
            },
            ref: string
        }
        
    };

    export class Selection extends React.Component<State, { label?: string|JSX.Element }> {
        state = { label: void 0}

        //private observer: Bootstrap.Rx.IDisposable | undefined = void 0;
        private observerChannels: Bootstrap.Rx.IDisposable | undefined = void 0;
        componentWillMount() {
            CommonUtils.Selection.SelectionHelper.attachOnResidueBulkSelectHandler(((r:CommonUtils.Selection.LightResidueInfo[])=>{    
                if(r.length===0){
                    this.setState({
                        label: void 0
                    });
                    return;
                }
                let label = r.map((val,idx,array)=>{
                    let name = CommonUtils.Residues.getName(val.authSeqNumber,this.props.plugin);
                    return `${name}&nbsp;${val.authSeqNumber}&nbsp;${val.chain.authAsymId}`;
                }).reduce((prev,cur,idx,array)=>{
                    return `${prev}${(idx===0)?'':',\n'}${cur}`;
                });
                let items = label.split('\n');
                let elements = [];
                for(let e of items){
                    let lineParts = e.split('&nbsp;');
                    elements.push(
                        <div>
                            {lineParts[0]}&nbsp;{lineParts[1]}&nbsp;{lineParts[2]}
                        </div>
                    );
                }
                this.setState({ 
                    label: <div className="columns">{elements}</div>
                });
            }).bind(this));

            CommonUtils.Selection.SelectionHelper.attachOnPointBulkSelectHandler(((points:CommonUtils.Selection.StringPoint[])=>{
                let elements = [];
                for(let e of points){
                    elements.push(
                        <div>
                            [{Number(e.x).toFixed(2)},&nbsp;{Number(e.y).toFixed(2)},&nbsp;{Number(e.z).toFixed(2)}]
                        </div>
                    );
                }
                this.setState({ 
                    label: <div className="columns points">{elements}</div>
                });
            }).bind(this));

            CommonUtils.Selection.SelectionHelper.attachOnClearSelectionHandler((()=>{
                this.setState({ label: void 0});
            }).bind(this));

            this.observerChannels = this.props.plugin.subscribe(Bootstrap.Event.Visual.VisualSelectElement, e => {
                let eventData = e.data as ChannelEventInfo;
                if(e.data !== void 0 && eventData.source !== void 0 && eventData.source.props !== void 0 && eventData.source.props.tag === void 0){
                    return;
                }

                if (e.data && (eventData === void 0 || e.data.kind !== 0)) {
                    if(CommonUtils.Selection.SelectionHelper.isSelectedAnyChannel()){
                        let data = e.data as ChannelEventInfo;
                        let c = data.source.props.tag.element;

                        $("#left-tabs li a[href='#left-tabs-1']")
                            .text(`Channel profile (${CommonUtils.Tunnels.getName(c)})`);

                        let len = CommonUtils.Tunnels.getLength(c);
                        let name = CommonUtils.Tunnels.getName(c);
                        let namePart = (name===void 0)?'':` (${name})`;
                        //let bneck = CommonUtils.Tunnels.getBottleneck(c);
                        /*let annotation = Annotation.AnnotationDataProvider.getChannelAnnotation(c.Id);
                        if(annotation === void 0 || annotation === null){*/
                            this.setState({ label: <span><b>{c.Type}{namePart}</b>, {`Length: ${len} Å`}</span> });
                        /*}
                        else{
                            this.setState({ label: <span><b>{annotation.text}</b>, Length: {len} Å</span> });
                        }*/
                    }
                    else if(!CommonUtils.Selection.SelectionHelper.isSelectedAny()){
                        $("#left-tabs li a[href='#left-tabs-1']")
                            .text(`Channel profile`);
                        this.setState({ label: void 0})
                    }
                }
            });
        }

        componentWillUnmount() {
            /*if (this.observer) {
                this.observer.dispose();
                this.observer = void 0;
            }*/
            if (this.observerChannels) {
                this.observerChannels.dispose();
                this.observerChannels = void 0;
            }
        }

        render() {
            return <div>
                <div className="ui-selection-header">
                    <span>Selection</span>
                    <div className="btn btn-xs btn-basic ui-selection-clear" onClick={(e)=>{
                        let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
                        CommonUtils.Selection.SelectionHelper.clearSelection(plugin);
                        //CommonUtils.Selection.SelectionHelper.clearAltSelection(plugin);
                        }}>(Clear selection)</div>
                </div>  
                <div className="ui-selection">{ !this.state.label 
                    ? <i>Click on atom residue or channel</i>
                    : this.state.label}
                </div>
            </div>
        }
    }

    export class Section extends React.Component<{ header: string, count: number }, { isExpanded: boolean }> {
        state = { isExpanded: false }

        private toggle(e: React.MouseEvent<HTMLElement>) {
            e.preventDefault();
            this.setState({ isExpanded: !this.state.isExpanded });
        }

        render() {
            return <div className="ui-item-container" style={{ position: 'relative' }}>
                <div className="ui-subheader"><a href='#' onClick={e => this.toggle(e)} className='section-header'><div style={{ width: '15px', display: 'inline-block', textAlign: 'center' }}>{this.state.isExpanded ?  '-' : '+'}</div> {this.props.header} ({this.props.count})</a></div>
                <div style={{ display: this.state.isExpanded ? 'block' : 'none' }}>{this.props.children}</div>
            </div>
        }
    }

    export class Renderable extends React.Component<{ label: string | JSX.Element, element: any, toggle: (plugin: Plugin.Controller, elements: any[], visible: boolean) => Promise<any> } & State, { }> {
    
        private toggle() {
            this.props.element.__isBusy = true;
            this.forceUpdate(() =>
                this.props.toggle(this.props.plugin, [this.props.element], !this.props.element.__isVisible)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
        }

        private highlight(isOn: boolean) {
            this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn });
        }


        render() {           
            return <div className="ui-label">
                <input type='checkbox' checked={!!this.props.element.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.element.__isBusy} />
                <label className="ui-label-element" onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                     {this.props.label}
                </label>
            </div>
        }
    }

    export class Channels extends React.Component<{state: State, channels: any[], header: string }, { isBusy: boolean }> {
        state = { isBusy: false }

        private show(visible: boolean) {
            for (let element of this.props.channels) { element.__isBusy = true; }
            this.setState({ isBusy: true }, () => 
                State.showChannelVisuals(this.props.state.plugin, this.props.channels, visible)
                    .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
        }

        private isDisabled(){
            return !this.props.channels || (this.props.channels!==void 0 && this.props.channels.length==0);
        }

        render() {
            return <Section header={this.props.header} count={(this.props.channels || '').length}>
                <div className='ui-show-all'><button className="btn btn-primary btn-xs" onClick={() => this.show(true)} disabled={this.state.isBusy||this.isDisabled()}>All</button><button className="btn btn-primary btn-xs" onClick={() => this.show(false)} disabled={this.state.isBusy||this.isDisabled()}>None</button></div>
                { this.props.channels && this.props.channels.length > 0
                    ? this.props.channels.map((c, i) => <Channel key={i} channel={c} state={this.props.state} />)
                    : <div className="ui-label ui-no-data-available">No data available...</div>}
            </Section>
        }
    }

    export class Channel extends React.Component<{state:State, channel: any }, { isVisible: boolean, isWaitingForData:boolean }> {
        state = { isVisible: false, isWaitingForData: false };

        componentDidMount(){
            /*
            MoleOnlineWebUI.Bridge.Events.subscribeChannelSelect(((channelId:string)=>{
                if(this.props.channel.Id === channelId){
                    this.selectChannel();
                }
            }).bind(this));*/
        }

        private dataWaitHandler(){
            let state = this.state;
            state.isWaitingForData = false;
            this.setState(state);
        }

        public invokeDataWait(){
            if(this.state.isWaitingForData){
                return;
            }

            let state = this.state;
            state.isWaitingForData = true;
            this.setState(state);
            //Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
        }

        render() {
            let c = this.props.channel as DataInterface.Tunnel;
            let len = CommonUtils.Tunnels.getLength(c);
            let name = MoleOnlineWebUI.Cache.TunnelName.get(c.GUID);
            let namePart = (name===void 0)?'':` (${name})`;        
            return <Renderable label={<span><b><a onClick={this.selectChannel.bind(this)}>{c.Type}{namePart}</a></b><ColorPicker tunnel={this.props.channel}/>, {`Length: ${len} Å`}</span>} element={c} toggle={(p:LiteMol.Plugin.Controller,ch:DataInterface.Tunnel[]&State.TunnelMetaInfo[],v:boolean)=>{                
                    return State.showChannelVisuals(p,ch,v)
                        .then(res=>{
                            this.props.channel = ch[0];
                            this.forceUpdate();
                        })
                }
            } {...this.props.state} />
        }

        private selectChannel(){
            let entity = this.props.state.plugin.context.select(this.props.channel.__id)[0];
            if(entity === void 0 || entity.ref === "undefined"){
                State.showChannelVisuals(this.props.state.plugin,[this.props.channel],true);
                let state = this.state;
                state.isVisible=true;
                this.setState(state);
                window.setTimeout((()=>{
                    this.selectChannel();
                }).bind(this),50);
                return;
            }
            let channelRef = entity.ref;
            let plugin = this.props.state.plugin;
            
            plugin.command(Bootstrap.Command.Entity.Focus, plugin.context.select(channelRef));
            plugin.command(LiteMol.Bootstrap.Event.Visual.VisualSelectElement, Bootstrap.Interactivity.Info.selection(entity, [0]));
        }
    }

    export class Cavities extends React.Component<{ state:State, cavities: any[], header: string }, { isBusy: boolean }> {
        state = { isBusy: false }
        private show(visible: boolean) {
            for (let element of this.props.cavities) { element.__isBusy = true; }
            this.setState({ isBusy: true }, () => 
                State.showCavityVisuals(this.props.state.plugin, this.props.cavities, visible)
                    .then(() => this.setState({ isBusy: false })).catch(() => this.setState({ isBusy: false })));
        }

        private isDisabled(){
            return !this.props.cavities ||(this.props.cavities!==void 0 && this.props.cavities.length==0);
        }

        render() {
            return <Section header={this.props.header} count={(this.props.cavities || '').length}>
                <div className='ui-show-all'><button className="btn btn-primary btn-xs" onClick={() => this.show(true)} disabled={this.state.isBusy||this.isDisabled()}>All</button><button className="btn btn-primary btn-xs" onClick={() => this.show(false)} disabled={this.state.isBusy||this.isDisabled()}>None</button></div>
                { this.props.cavities && this.props.cavities.length > 0
                    ? this.props.cavities.map((c, i) => <Cavity key={i} cavity={c} state={this.props.state} />)
                    : <div className="ui-label ui-no-data-available">No data available...</div>}
            </Section>
        }
    }

    export class Cavity extends React.Component<{state: State, cavity: any }, { isVisible: boolean }> {
        state = { isVisible: false };

        render() {
            let c = this.props.cavity;
            return <div>
                <Renderable label={<span><b>{c.Id}</b>, {`Volume: ${c.Volume | 0} Å`}<sup>3</sup></span>} element={c} toggle={State.showCavityVisuals} {...this.props.state} />
            </div>
        }
    }

     export class Origins extends React.Component<{ label: string | JSX.Element, origins: any } & State, { }> {
        private toggle() {
            this.props.origins.__isBusy = true;
            this.forceUpdate(() =>
                State.showOriginsSurface(this.props.plugin, this.props.origins, !this.props.origins.__isVisible)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
        }

        private highlight(isOn: boolean) {
            this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.origins.__id), isOn });
        }

        render() {
            if (this.props.origins.Points===void 0 || !this.props.origins.Points.length) {
                return <div style={{ display: 'none' }} />
            }

            return <div>
                <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                    <input type='checkbox' checked={!!this.props.origins.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.origins.__isBusy} /> {this.props.label}
                </label>
            </div>
        }
    }


    let __colorPickerIdSeq = 0;
    function generateColorPickerId(){
        return `color-picker-${__colorPickerIdSeq++}`;
    }
    export class ColorPicker extends React.Component<{tunnel:DataInterface.Tunnel & State.TunnelMetaInfo},{visible:boolean}>{
        state = {visible:false}
        private id:string;

        componentDidMount(){
            this.id = generateColorPickerId();
            $(window).on('click',((e:MouseEvent)=>{
                if(!this.state.visible){
                    return;
                }
                let el = ($("#"+this.id)[0] as HTMLElement).children[0];
                let rect = el.getBoundingClientRect();

                if(!(e.clientX>=rect.left && e.clientX<=rect.left+rect.width
                    && e.clientY >= rect.top && e.clientY<= rect.top+rect.height)){
                    this.setState({visible:false});
                }
            }).bind(this));
        }

        render(){
            if(!this.props.tunnel.__isVisible){
                return <span/>
            }

            let color = (this.props.tunnel.__color!==void 0)?this.props.tunnel.__color:MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Colors.get(MoleOnlineWebUI.StaticData.LiteMolObjectsColorScheme.Enum.DefaultColor);
            let plugin = MoleOnlineWebUI.Bridge.Instances.getPlugin();
            if(this.state.visible){
                return <div className="color-picker" id={this.id}>
                        <LiteMol.Plugin.Controls.ColorPicker color={color} onChange={c => {                
                        this.props.tunnel.__color = c;
                        State.showChannelVisuals(plugin,[this.props.tunnel],(this.props.tunnel as any).__isVisible, true);
                    }} />
                </div>
            }
            else{
                return <div className="color-picker" id={this.id} style={{backgroundColor:`rgb(${Math.ceil(color.r*255)},${Math.ceil(color.g*255)},${Math.ceil(color.b*255)})`}} onClick={(e)=>{
                    this.setState({visible:true});
                    }}/>
            }
        }
    }

}
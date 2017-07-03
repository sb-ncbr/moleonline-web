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
        }

        private onContentResize(_:any){
            let prevState = this.props.plugin.context.layout.latestState;
            this.props.plugin.setLayoutState({isExpanded:true});
            this.props.plugin.setLayoutState(prevState);
        }

        load() {
            this.currentProteinId = SimpleRouter.GlobalRouter.getCurrentPid();

            this.setState({ isLoading: true, error: void 0 });      //https://webchem.ncbr.muni.cz/API/ChannelsDB/PDB/1tqn
            State.loadData(this.props.plugin, this.currentProteinId, `https://webchem.ncbr.muni.cz/API/ChannelsDB/PDB/${this.currentProteinId}`) //'channels.json'
                .then(data => {
                    //console.log("loading done ok");
                    let _data = (this.props.plugin.context.select("mole-data")[0] as Bootstrap.Entity.Data.Json).props.data as DataInterface.MoleData;
                    if((_data as any).Error !== void 0){
                        this.setState({ isLoading: false, error: (_data as any).Error as string });
                    }
                    else{
                        this.setState({ 
                            isLoading: false, data: _data 
                        });
                    }
                })
                .catch(e => {
                    console.log(`ERR on loading: ${e}`);
                    this.setState({ isLoading: false, error: 'Application was unable to load data. Please try again later.' });
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
            return <div>
                <Selection {...this.props} />

                <div className="ui-header">
                    Channels
                </div>
                <div>
                    <Channels channels={this.props.data.Channels.ReviewedChannels} state={this.props}  header='Reviewed Channels' />
                    <Channels channels={this.props.data.Channels.CSATunnels} state={this.props}  header='CSA Tunnels' />
                    <Channels channels={this.props.data.Channels.TransmembranePores} state={this.props}  header='Transmembrane Pores' />
                    <Channels channels={this.props.data.Channels.CofactorTunnels} state={this.props}  header='Cofactor Tunnels' />
                </div>
            </div>;
            /*
            <h2>Empty Space</h2>
                <Cavities cavities={[this.props.data.Cavities.Surface]} state={this.props} header='Surface' />
                <Cavities cavities={this.props.data.Cavities.Cavities} state={this.props} header='Cavities' />
                <Cavities cavities={this.props.data.Cavities.Voids} state={this.props} header='Voids' />
                
                <h2>Origins</h2>
                <Origins origins={this.props.data.Origins.User} {...this.props} label='User Specifed (optimized)' />
                <Origins origins={this.props.data.Origins.InputOrigins} {...this.props} label='User Specifed' />                
                <Origins origins={this.props.data.Origins.Computed} {...this.props} label='Computed' />
                <Origins origins={this.props.data.Origins.Database} {...this.props} label='Database' />
             */
            
            /*
            return <div>
                <Selection {...this.props} />

                <h2>Channels</h2>
                <Channels channels={this.props.data.Channels} state={this.props}  header='Tunnels' />
            </div>;
            */
            
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

        private observer: Bootstrap.Rx.IDisposable | undefined = void 0;
        private observerChannels: Bootstrap.Rx.IDisposable | undefined = void 0;
        componentWillMount() {
            
            this.observer = this.props.plugin.subscribe(Bootstrap.Event.Molecule.ModelSelect, e => {
                if (!e.data) {
                    this.setState({ label: void 0})
                } else {
                    let r = e.data.residues[0];
                    this.setState({ label: `${r.name} ${r.authSeqNumber} ${r.chain.authAsymId}` });
                }
            });
            

            this.observerChannels = this.props.plugin.subscribe(Bootstrap.Event.Visual.VisualSelectElement, e => {
                let eventData = e.data as ChannelEventInfo;
                if(e.data !== void 0 && eventData.source !== void 0 && eventData.source.props !== void 0 && eventData.source.props.tag === void 0){
                    return;
                }

                if (!e.data || (eventData !== void 0 && e.data.kind === 0)) {
                    this.setState({ label: void 0})
                } else {
                    let data = e.data as ChannelEventInfo;
                    let c = data.source.props.tag.element;
                    let len = CommonUtils.Tunnels.getLength(c);
                    //let bneck = CommonUtils.Tunnels.getBottleneck(c);
                    let annotation = Annotation.AnnotationDataProvider.getChannelAnnotation(c.Id);
                    if(annotation === void 0 || annotation === null){
                        this.setState({ label: <span><b>{c.Type}</b>, {`Length: ${len} Å`}</span> });
                    }
                    else{
                        this.setState({ label: <span><b>{annotation.text}</b>, Length: {len} Å</span> });
                    }
                }
            });
        }

        componentWillUnmount() {
            if (this.observer) {
                this.observer.dispose();
                this.observer = void 0;
            }
            if (this.observerChannels) {
                this.observerChannels.dispose();
                this.observerChannels = void 0;
            }
        }

        render() {
            return <div>
                <div className="ui-selection-header">Selection</div>  
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

    export class Renderable extends React.Component<{ label: string | JSX.Element, element: any, annotations?: Annotation.ChannelAnnotation[], toggle: (plugin: Plugin.Controller, elements: any[], visible: boolean) => Promise<any> } & State, { isAnnotationsVisible:boolean }> {
        
        state = {isAnnotationsVisible: false};

        private toggle() {
            this.props.element.__isBusy = true;
            this.forceUpdate(() =>
                this.props.toggle(this.props.plugin, [this.props.element], !this.props.element.__isVisible)
                    .then(() => this.forceUpdate()).catch(() => this.forceUpdate()));
        }

        private highlight(isOn: boolean) {
            this.props.plugin.command(Bootstrap.Command.Entity.Highlight, { entities: this.props.plugin.context.select(this.props.element.__id), isOn });
        }

        private toggleAnnotations(e:any){
            this.setState({isAnnotationsVisible:!this.state.isAnnotationsVisible});
        }

        private getAnnotationToggler(){
            return [(this.state.isAnnotationsVisible)
                ?<span className="hand glyphicon glyphicon-chevron-up" title="Hide list annotations for this channel" onClick={this.toggleAnnotations.bind(this)} />
            :<span className="hand glyphicon glyphicon-chevron-down" title="Show all annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />];
        }

        private getAnnotationsElements(){
            if(this.props.annotations === void 0){
                return [];
            }
            if(!this.state.isAnnotationsVisible){
                return [];
            }
            let elements:JSX.Element[] = [];
            for(let annotation of this.props.annotations){
                let reference = <i>(No reference provided)</i>;
                if(annotation.reference!==""){
                    reference = <a target="_blank" href={annotation.link}>{annotation.reference} <span className="glyphicon glyphicon-new-window"/></a>;
                }
                elements.push(
                    <div className="annotation-line">
                        <span className="bullet"/> <b>{annotation.text}</b>, {reference}
                    </div>
                );
            }
            return elements;
        }

        render() {           

            let emptyToggler = <span className="disabled glyphicon glyphicon-chevron-down" title="No annotations available for this channel" onClick={this.toggleAnnotations.bind(this)} />
            return <div className="ui-label">
                <input type='checkbox' checked={!!this.props.element.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.element.__isBusy} />
                <label className="ui-label-element" onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                     {(this.props.annotations!==void 0 && this.props.annotations.length>0)?this.getAnnotationToggler():emptyToggler} {this.props.label}
                </label>
                {this.getAnnotationsElements()}
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

        private dataWaitHandler(){
            this.setState({isWaitingForData:false});
        }

        public invokeDataWait(){
            if(this.state.isWaitingForData){
                return;
            }

            this.setState({isWaitingForData: true});
            Annotation.AnnotationDataProvider.subscribeForData(this.dataWaitHandler.bind(this));
        }

        render() {
            let c = this.props.channel as DataInterface.Tunnel;
            let len = CommonUtils.Tunnels.getLength(c);

            let annotations = Annotation.AnnotationDataProvider.getChannelAnnotations(c.Id);
            if(annotations === void 0){
                this.invokeDataWait();
            }

            if(annotations!==null && annotations !== void 0){
                let annotation = annotations[0];
                return <Renderable annotations={annotations} label={<span><b><a onClick={this.selectChannel.bind(this)}>{annotation.text}</a></b>, Length: {len} Å</span>} element={c} toggle={State.showChannelVisuals} {...this.props.state} />
            }
            else{
                return <Renderable label={<span><b>{c.Type}</b>, {`Length: ${len} Å`}</span>} element={c} toggle={State.showChannelVisuals} {...this.props.state} />
            }
        }

        private selectChannel(){
            let entity = this.props.state.plugin.context.select(this.props.channel.__id)[0];
            if(entity == void 0){
                State.showChannelVisuals(this.props.state.plugin,[this.props.channel],true);
                this.setState({isVisible:true});
                window.setTimeout((()=>{this.selectChannel()}).bind(this),50);
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
            if (!this.props.origins.Points.length) {
                return <div style={{ display: 'none' }} />
            }

            return <div>
                <label onMouseEnter={() => this.highlight(true)} onMouseLeave={() => this.highlight(false)} >
                    <input type='checkbox' checked={!!this.props.origins.__isVisible} onChange={() => this.toggle()} disabled={!!this.props.origins.__isBusy} /> {this.props.label}
                </label>
            </div>
        }
    }

}
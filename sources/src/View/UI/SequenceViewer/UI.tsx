import React from "react";
import { ProteinData } from "../../../DataInterface";
import { Events, Instances } from "../../../Bridge";
import { Residues } from "../../CommonUtils/Residues";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Context } from "../../Context";
import { Structure } from "molstar/lib/mol-model/structure";
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { arrayEqual } from "molstar/lib/mol-util";
import { getChainOptions, getModelEntityOptions, getOperatorOptions, getSequenceWrapper, getStructureOptions, SequenceView, SequenceViewMode} from "molstar/lib/mol-plugin-ui/sequence"
import { SequenceWrapper } from "molstar/lib/mol-plugin-ui/sequence/wrapper";
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { PolymerSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/polymer';
import { HeteroSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/hetero';
import { StructureProperties as Props, StructureElement } from 'molstar/lib/mol-model/structure';
import { PluginUIContext } from "molstar/lib/mol-plugin-ui/context";
import { EmptyLoci } from "molstar/lib/mol-model/loci";


declare function $(p: any): any;

type DataType = ProteinData;

type State = {
    data: DataType | null,
    minimized: boolean,
    structure: Structure,
    structureRef: string,
    structureOptions: { options: [string, string][], all: Structure[] },
    modelEntityId: string,
    chainGroupId: number,
    operatorKey: string,
    mode: SequenceViewMode
};

const MaxSequenceWrappersCount = 30;
const SequenceViewModeParam = PD.Select<SequenceViewMode>('single', [['single', 'Chain'], ['polymers', 'Polymers'], ['all', 'Everything']]);

export class SequenceViewer extends React.Component<{ controller: Context }, State> {

    state: State = {
        data: null,
        minimized: false,
        structure: Structure.Empty,
        structureRef: '',
        structureOptions: { options: [], all: [] },
        modelEntityId: '',
        chainGroupId: -1,
        operatorKey: '',
        mode: 'all'
    };

    componentDidMount() {
        this.props.controller.plugin.state.events.object.updated.subscribe(({ref, obj}) => {
            if (ref === this.state.structureRef && obj && obj.type === PSO.Molecule.Structure.type && obj.data !== this.state.structure) {
                this.sync();
            }
        })

        this.props.controller.plugin.state.events.object.created.subscribe(({ ref, obj }) => {
            if (obj && obj.type === PSO.Molecule.Structure.type) {
                this.sync();
            }
        });

        this.props.controller.plugin.state.events.object.removed.subscribe(({ obj }) => {
            if (obj && obj.type === PSO.Molecule.Structure.type && obj.data === this.state.structure) {
                this.sync();
            }
        });

        Events.subscribeProteinDataLoaded((data) => {
            this.setState({
                data,
                minimized: this.state.minimized
            })
        });
    }

    componentWillUnmount() {
    }

    private getStructure(ref: string) {
        const state = this.props.controller.plugin.state.data;
        const cell = state.select(ref)[0];
        if (!ref || !cell || !cell.obj) return Structure.Empty;
        return (cell.obj as PSO.Molecule.Structure).data;
    }

    private sync() {
        const structureOptions = getStructureOptions(this.props.controller.plugin.state.data);
        if (arrayEqual(structureOptions.all, this.state.structureOptions.all)) return;
        this.setState(this.getInitialState());
    }

    private getInitialState(): State {
        const structureOptions = getStructureOptions(this.props.controller.plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const structure = this.getStructure(structureRef);
        const data = null;
        const minimized = false;
        let modelEntityId = getModelEntityOptions(structure)[0][0];
        let chainGroupId = getChainOptions(structure, modelEntityId)[0][0];
        let operatorKey = getOperatorOptions(structure, modelEntityId, chainGroupId)[0][0];
        if (this.state.structure && this.state.structure === structure) {
            modelEntityId = this.state.modelEntityId;
            chainGroupId = this.state.chainGroupId;
            operatorKey = this.state.operatorKey;
        }
        return { data, minimized, structure, structureRef, structureOptions, modelEntityId, chainGroupId, operatorKey, mode: 'all'}
    }

    private get params() {
        const { structureOptions, structure, modelEntityId, chainGroupId } = this.state;
        const entityOptions = getModelEntityOptions(structure);
        const chainOptions = getChainOptions(structure, modelEntityId);
        const operatorOptions = getOperatorOptions(structure, modelEntityId, chainGroupId);
        return {
            structure: PD.Select(structureOptions.options[0][0], structureOptions.options, { shortLabel: true }),
            entity: PD.Select(entityOptions[0][0], entityOptions, { shortLabel: true }),
            chain: PD.Select(chainOptions[0][0], chainOptions, { shortLabel: true, twoColumns: true, label: 'Chain' }),
            operator: PD.Select(operatorOptions[0][0], operatorOptions, { shortLabel: true, twoColumns: true }),
            mode: SequenceViewModeParam
        };
    }

    private getSequenceWrappers(params: SequenceView['params']) {
        const structure = this.getStructure(this.state.structureRef);
        const wrappers: { wrapper: (string | SequenceWrapper.Any), label: string, operatorName: string }[] = [];

        for (const [modelEntityId, eLabel] of getModelEntityOptions(structure, false)) {
            for (const [chainGroupId, cLabel] of getChainOptions(structure, modelEntityId)) {
                for (const [operatorKey, operator_name] of getOperatorOptions(structure, modelEntityId, chainGroupId)) {
                    wrappers.push({
                        wrapper: getSequenceWrapper({
                            structure,
                            modelEntityId,
                            chainGroupId,
                            operatorKey
                        }, this.props.controller.plugin.managers.structure.selection),
                        label: `${cLabel}`,
                        operatorName: operator_name
                    });
                    if (wrappers.length > MaxSequenceWrappersCount) return [];
                }
            }
        }
        return wrappers;
    }

    render() {
        if (this.getStructure(this.state.structureRef) !== Structure.Empty) {
            const params = this.params;
            const sequenceWrappers = this.getSequenceWrappers(params);

            return <div className={(this.state.minimized) ? "minimized" : ""}>
                <Header onClick={() => {
                    let s = this.state;
                    let newMinimized = !s.minimized;
                    s.minimized = newMinimized;
                    this.setState(s);

                    Events.invokeOnSequneceViewerToggle({ minimized: newMinimized });
                }} />
                <div className="seq-container">
                    {(this.state.structureRef === "") ? <div className="seq-waiting-for-data">Waiting for protein data...</div> : <Sequence sequenceWrappers={sequenceWrappers} plugin={this.props.controller.plugin}/>}
                </div>
            </div>
        }
        return <div className={(this.state.minimized) ? "minimized" : ""}>
                <Header onClick={() => {
                    let s = this.state;
                    let newMinimized = !s.minimized;
                    s.minimized = newMinimized;
                    this.setState(s);

                    Events.invokeOnSequneceViewerToggle({ minimized: newMinimized });
                }} />
                <div className="seq-container">
                    <div className="seq-waiting-for-data">Waiting for protein data...</div>
                </div>
            </div>

    }
}

class Header extends React.Component<{ onClick: () => void }, {}> {
    render() {
        return <div className="sequence-viewer-header" onClick={this.props.onClick}>
            Protein Sequence <span className="glyphicon glyphicon-resize-vertical" />
        </div>
    }
}

type SeqWrapper = {
    wrapper: string | SequenceWrapper.Any,
    label: string,
    operatorName: string
}[]

class Sequence extends React.Component<{ sequenceWrappers: SeqWrapper, plugin: PluginUIContext}, {}> {

    private groupByChains2(wrappers: SeqWrapper) {
        let groups: SeqWrapper = [];
        wrappers.forEach((wrapper) => {
            if (wrapper.wrapper instanceof PolymerSequenceWrapper) {
                groups.push(wrapper);
            }
        })

        return groups;
    }

    private getAllHETResiduesIdxes2(wrappers: SeqWrapper) {
        let rv: SeqWrapper = [];

        wrappers.forEach((wrapper) => {
            if (wrapper.wrapper instanceof HeteroSequenceWrapper) {
                if (wrapper.wrapper.residueLabel(0) !== 'HOH') {
                    rv.push(wrapper);
                }
            }
        })

        return rv;
    }

    render() {
        let chains: JSX.Element[] = [];
        let chainGroups = this.groupByChains2(this.props.sequenceWrappers);

        chainGroups.forEach((chain) => {
            if (typeof chain.wrapper !== 'string') {
                chains.push(<Chain chainWrapper={chain.wrapper} chainName={chain.label} operatorName={chain.operatorName} plugin={this.props.plugin} />);
            }
        });

        let hetResidues = this.getAllHETResiduesIdxes2(this.props.sequenceWrappers);
        if (hetResidues.length > 0) {
            chains.push(
                <HETChain hetWrappers={hetResidues} plugin={this.props.plugin}/>
            );
        }

        return <div>
            {chains}
        </div>
    }
}

class Chain extends React.Component<{ chainWrapper: SequenceWrapper.Any, chainName: string, operatorName: string, plugin: PluginUIContext }, {}> {
    render() {
        let seqResidues: JSX.Element[] = [];
        let lastSeqNumber = -1;

        const sw = this.props.chainWrapper;
        const location = StructureElement.Location.create(void 0);

        let seqNumberShowCounter = 0;
        for (let i = 0, il = sw.length; i < il; ++i) {
            const label = sw.residueLabel(i);
            const loci = sw.getLoci(i);
            if (loci.elements.length > 0) {
                //TODO location = StructureElement.Stats.ofLoci(sequenceWrappers[0].wrapper.getLoci(5)).firstElementLoc
                const l = StructureElement.Loci.getFirstLocation(loci, location);
                if (l) {
                    let residueName = Props.atom.label_comp_id(l);
                    let chainName = Props.chain.auth_asym_id(l);
                    let operatorName = Props.unit.operator_name(l);
                    let isHet = false;//Props.residue.hasMicroheterogeneity(l);

                    if (residueName === "HOH" /*|| isHet === true*/ || isHet === undefined) {
                        continue;
                    }

                    let seqLetter = sw.residueLabel(i);
                    let seqNumber = Props.residue.auth_seq_id(l);
                    
                    let nextSeqNumber = -1;
                    if (i + 1 < sw.length) {
                        const l_next = StructureElement.Loci.getFirstLocation(sw.getLoci(i+1), location);
                        if (l_next) nextSeqNumber = Props.residue.auth_seq_id(l_next);
                    }

                    let showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                    let nextShowSeqNumber = String(nextSeqNumber) !== String(seqNumber.valueOf() + 1);

                    seqNumberShowCounter = (showSeqNumber) ? 0 : seqNumberShowCounter + 1;

                    if (seqNumberShowCounter % 20 === 0 && seqNumberShowCounter > 0 && !nextShowSeqNumber) {
                        showSeqNumber = true;
                        seqNumberShowCounter = 0;
                    }

                    lastSeqNumber = seqNumber.valueOf();

                    seqResidues.push(
                        <SeqResidue 
                            residueName={residueName} 
                            chainName={chainName}
                            operatorName={operatorName}
                            seqLetter={seqLetter} 
                            seqNumber={seqNumber} 
                            showSeqNumber={showSeqNumber} 
                            isHET={false} 
                            plugin={this.props.plugin}
                            loci={loci}
                        />
                    );
                }


            }
        }

        if (seqResidues.length === 0) {
            return <div />
        }

        return <div className="seq-chain">
            <div className="seq-header">Chain {this.props.chainName} [{this.props.operatorName}]</div>
            <div className="seq-content">
                {seqResidues}
            </div>
        </div>
    }
}

class HETChain extends React.Component<{ hetWrappers: SeqWrapper, plugin: PluginUIContext }, {}> {
    render() {
        let seqResidues: JSX.Element[] = [];
        let lastSeqNumber = -1;

        const location = StructureElement.Location.create(void 0);
        
        this.props.hetWrappers.forEach((wrapper) => {
            const sw = wrapper.wrapper;
            if (typeof sw !== 'string') {
                for (let i = 0, il = sw.length; i < il; ++i) {
                    const loci = sw.getLoci(i);
                    if (loci.elements.length > 0) {
                        const l = StructureElement.Loci.getFirstLocation(loci, location);
                        if (l) {
                            let residueName = Props.atom.label_comp_id(l);
                            let chainName = Props.chain.auth_asym_id(l);
                            let operatorName = Props.unit.operator_name(l);
                            let isHet = true;

                            if (residueName === "HOH") {
                                continue;
                            }

                            let seqLetter = sw.residueLabel(i);
                            let seqNumber = Props.residue.auth_seq_id(l);

                            let showSeqNumber = String(seqNumber) !== String(lastSeqNumber + 1);
                            lastSeqNumber = seqNumber.valueOf();
                            seqResidues.push(
                                <SeqResidue 
                                    residueName={residueName}
                                    chainName={chainName}
                                    operatorName={operatorName}
                                    seqLetter={seqLetter}
                                    seqNumber={seqNumber}
                                    showSeqNumber={showSeqNumber}
                                    isHET={true}
                                    plugin={this.props.plugin}
                                    loci={loci}
                                />
                            );
                        }
                    }
                }

            }
        })

        if (seqResidues.length === 0) {
            return <div />
        }

        return <div className="seq-chain">
            <div className="seq-header">HET</div>
            <div className="seq-content">
                {seqResidues}
            </div>
        </div>
    }
}

interface SeqResidueProps {
    residueName: string,
    chainName: String,
    operatorName: string,
    seqNumber: Number,
    seqLetter: string,
    isHET: boolean,
    showSeqNumber: boolean,
    plugin: PluginUIContext,
    loci: StructureElement.Loci
}
interface SeqResidueState { selected: boolean }
class SeqResidue extends React.Component<SeqResidueProps, SeqResidueState> {
    state: SeqResidueState = { selected: false };

    shouldComponentUpdate(nextProps: SeqResidueProps, nextState: SeqResidueState) {
        if (nextState.selected !== this.state.selected) {
            return true;
        }

        if ((nextProps.chainName !== this.props.chainName)
            || (nextProps.isHET !== this.props.isHET)
            || (nextProps.residueName !== this.props.residueName)
            || (nextProps.operatorName !== this.props.operatorName)
            || (nextProps.seqLetter !== this.props.seqLetter)
            || (nextProps.seqNumber !== this.props.seqNumber)
            || (nextProps.showSeqNumber !== this.props.showSeqNumber)) {
            return true;
        }

        return false;
    }

    componentDidMount() {
        SelectionHelper.attachOnClearSelectionHandler(() => {
            if (this.state.selected) {
                this.setState({ selected: false });
            }
        });

        SelectionHelper.attachOnResidueSelectHandler(residues => {
            let futureSelected = residues.some((val, idx, arr) => {
                return val.authSeqNumber === this.props.seqNumber && val.chain.authAsymId === this.props.chainName && this.props.operatorName === val.operatorName;
            });

            if (futureSelected !== this.state.selected) {
                this.setState({
                    selected: futureSelected
                })
            }
        });
    }

    render() {
        return <div className={`seq-residue${(this.props.isHET) ? ' het' : ''}`}>
            <div className="seq-number">{(this.props.showSeqNumber) ? this.props.seqNumber.valueOf() : ""}</div>
            <div className={`seq-letter${(this.state.selected) ? " selected" : ""}`} onMouseDown={(e) => {
                // SelectionHelper.addResidueToSelection(this.props.seqNumber.valueOf(), this.props.chainName.valueOf(), this.props.operatorName, this.props.isHET, this.props.residueName);
            }} onMouseMove={(e) => {
                this.props.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: this.props.loci })
            }} onMouseOut={(e) => {
                this.props.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci });
            }} title={`${this.props.residueName} ${this.props.chainName} ${this.props.seqNumber}`}>{this.props.seqLetter}</div>
        </div>
    }
}

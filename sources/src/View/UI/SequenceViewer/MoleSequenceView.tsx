/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Copyright (c) 2018-2021 mol* contributors, licensed under MIT, See LICENSE file for more info.
 *
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @author David Sehnal <david.sehnal@gmail.com>
 */

import * as React from 'react';
import { PluginUIComponent } from 'molstar/lib/mol-plugin-ui/base';
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import { Structure, StructureElement, StructureProperties as SP, Unit } from 'molstar/lib/mol-model/structure';
import { SequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/wrapper';
import { PolymerSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/polymer';
import { MarkerAction } from 'molstar/lib/mol-util/marker-action';
import { PureSelectControl } from 'molstar/lib/mol-plugin-ui/controls/parameters';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { HeteroSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/hetero';
import { State, StateSelection } from 'molstar/lib/mol-state';
import { ChainSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/chain';
import { ElementSequenceWrapper } from 'molstar/lib/mol-plugin-ui/sequence/element';
import { elementLabel } from 'molstar/lib/mol-theme/label';
import { Icon, HelpOutlineSvg } from 'molstar/lib/mol-plugin-ui/controls/icons';
import { StructureSelectionManager } from 'molstar/lib/mol-plugin-state/manager/structure/selection';
import { arrayEqual } from 'molstar/lib/mol-util/array';
import { MoleSequence } from './MoleSequence';

interface Wrapper { wrapper: (string | SequenceWrapper.Any), label: string, operatorName: string }

const MaxDisplaySequenceLength = 5000;
// TODO: add virtualized Select controls (at best with a search box)?
const MaxSelectOptionsCount = 1000;
// const MaxSequenceWrappersCount = 30; // uncomment for boundary

export function opKey(l: StructureElement.Location) {
    const ids = SP.unit.pdbx_struct_oper_list_ids(l);
    const ncs = SP.unit.struct_ncs_oper_id(l);
    const hkl = SP.unit.hkl(l);
    const spgrOp = SP.unit.spgrOp(l);
    return `${ids.sort().join(',')}|${ncs}|${hkl}|${spgrOp}`;
}

export function splitModelEntityId(modelEntityId: string) {
    const [modelIdx, entityId] = modelEntityId.split('|');
    return [parseInt(modelIdx), entityId];
}

export function getSequenceWrapper(state: { structure: Structure, modelEntityId: string, chainGroupId: number, operatorKey: string }, structureSelection: StructureSelectionManager): SequenceWrapper.Any | string {
    const { structure, modelEntityId, chainGroupId, operatorKey } = state;
    const l = StructureElement.Location.create(structure);
    const [modelIdx, entityId] = splitModelEntityId(modelEntityId);

    const units: Unit[] = [];

    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx) continue;
        if (SP.entity.id(l) !== entityId) continue;
        if (unit.chainGroupId !== chainGroupId) continue;
        if (opKey(l) !== operatorKey) continue;

        units.push(unit);
    }

    if (units.length > 0) {
        const data = { structure, units };
        const unit = units[0];

        let sw: SequenceWrapper<any>;
        if (unit.polymerElements.length) {
            const l = StructureElement.Location.create(structure, unit, unit.elements[0]);
            const entitySeq = unit.model.sequence.byEntityKey[SP.entity.key(l)];
            // check if entity sequence is available
            if (entitySeq && entitySeq.sequence.length <= MaxDisplaySequenceLength) {
                sw = new PolymerSequenceWrapper(data);
            } else {
                const polymerElementCount = units.reduce((a, v) => a + v.polymerElements.length, 0);
                if (Unit.isAtomic(unit) || polymerElementCount > MaxDisplaySequenceLength) {
                    sw = new ChainSequenceWrapper(data);
                } else {
                    sw = new ElementSequenceWrapper(data);
                }
            }
        } else if (Unit.isAtomic(unit)) {
            const residueCount = units.reduce((a, v) => a + (v as Unit.Atomic).residueCount, 0);
            if (residueCount > MaxDisplaySequenceLength) {
                sw = new ChainSequenceWrapper(data);
            } else {
                sw = new HeteroSequenceWrapper(data);
            }
        } else {
            console.warn('should not happen, expecting coarse units to be polymeric');
            sw = new ChainSequenceWrapper(data);
        }

        sw.markResidue(structureSelection.getLoci(structure), MarkerAction.Select);
        return sw;
    } else {
        return 'No sequence available';
    }
}

export function getModelEntityOptions(structure: Structure, polymersOnly = false): [string, string][] {
    const options: [string, string][] = [];
    const l = StructureElement.Location.create(structure);
    const seen = new Set<string>();

    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        const id = SP.entity.id(l);
        const modelIdx = structure.getModelIndex(unit.model);
        const key = `${modelIdx}|${id}`;
        if (seen.has(key)) continue;
        if (polymersOnly && SP.entity.type(l) !== 'polymer') continue;

        let description = SP.entity.pdbx_description(l).join(', ');
        if (structure.models.length) {
            if (structure.representativeModel) { // indicates model trajectory
                description += ` (Model ${structure.models[modelIdx].modelNum})`;
            } else if (description.startsWith('Polymer ')) { // indicates generic entity name
                description += ` (${structure.models[modelIdx].entry})`;
            }
        }
        const label = `${id}: ${description}`;
        options.push([key, label]);
        seen.add(key);

        if (options.length > MaxSelectOptionsCount) {
            return [['', 'Too many entities']];
        }
    }

    if (options.length === 0) options.push(['', 'No entities']);
    return options;
}

export function getChainOptions(structure: Structure, modelEntityId: string): [number, string, string][] {
    const options: [number, string, string][] = [];
    const l = StructureElement.Location.create(structure);
    const seen = new Set<number>();
    const [modelIdx, entityId] = splitModelEntityId(modelEntityId);

    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx) continue;
        if (SP.entity.id(l) !== entityId) continue;

        const id = unit.chainGroupId;
        const chainName = SP.chain.auth_asym_id(l);
        if (seen.has(id)) continue;

        // TODO handle special case
        // - more than one chain in a unit
        const label = elementLabel(l, { granularity: 'chain', hidePrefix: true, htmlStyling: false });

        options.push([id, label, chainName]);
        seen.add(id);

        if (options.length > MaxSelectOptionsCount) {
            return [[-1, 'Too many chains', '']];
        }
    }

    if (options.length === 0) options.push([-1, 'No chains', '']);
    return options;
}

export function getOperatorOptions(structure: Structure, modelEntityId: string, chainGroupId: number): [string, string][] {
    const options: [string, string][] = [];
    const l = StructureElement.Location.create(structure);
    const seen = new Set<string>();
    const [modelIdx, entityId] = splitModelEntityId(modelEntityId);

    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx) continue;
        if (SP.entity.id(l) !== entityId) continue;
        if (unit.chainGroupId !== chainGroupId) continue;

        const id = opKey(l);
        if (seen.has(id)) continue;

        const label = unit.conformation.operator.name;
        options.push([id, label]);
        seen.add(id);

        if (options.length > MaxSelectOptionsCount) {
            return [['', 'Too many operators']];
        }
    }

    if (options.length === 0) options.push(['', 'No operators']);
    return options;
}

export function getStructureOptions(state: State) {
    const options: [string, string][] = [];
    const all: Structure[] = [];

    const structures = state.select(StateSelection.Generators.rootsOfType(PSO.Molecule.Structure));
    for (const s of structures) {
        if (!s.obj?.data) continue;

        all.push(s.obj.data);
        options.push([s.transform.ref, s.obj!.data.label]);
    }

    if (options.length === 0) options.push(['', 'No structure']);
    return { options, all };
}

export type SequenceViewMode = 'single' | 'polymers' | 'all'
const SequenceViewModeParam = PD.Select<SequenceViewMode>('all', [['single', 'Chain'], ['polymers', 'Polymers'], ['all', 'Everything']]);

type SequenceViewState = {
    structureOptions: { options: [string, string][], all: Structure[] },
    structure: Structure,
    structureRef: string,
    modelEntityId: string,
    chainGroupId: number,
    operatorKey: string,
    mode: SequenceViewMode,
    operatorName: string,
}

export class MoleSequenceView extends PluginUIComponent<{ defaultMode?: SequenceViewMode }, SequenceViewState> {
    // constructor(props: { defaultMode?: SequenceViewMode }) {
    //     super(props);
    //     // this.setState({ structureOptions: { options: [], all: [] }, structure: Structure.Empty, structureRef: '', modelEntityId: '', chainGroupId: -1, operatorKey: '', mode: 'all', operatorName: '' })
    // }

    state: SequenceViewState = { structureOptions: { options: [], all: [] }, structure: Structure.Empty, structureRef: '', modelEntityId: '', chainGroupId: -1, operatorKey: '', mode: 'all', operatorName: '' };

    componentDidMount() {
        if (this.plugin.state.data.select(StateSelection.Generators.rootsOfType(PSO.Molecule.Structure)).length > 0) this.setState(this.getInitialState());

        this.subscribe(this.plugin.state.events.object.updated, ({ ref, obj }) => {
            if (ref === this.state.structureRef && obj && obj.type === PSO.Molecule.Structure.type && obj.data !== this.state.structure) {
                this.sync();
            }
        });

        this.subscribe(this.plugin.state.events.object.created, ({ obj }) => {
            if (obj && obj.type === PSO.Molecule.Structure.type) {
                this.sync();
            }
        });

        this.subscribe(this.plugin.state.events.object.removed, ({ obj }) => {
            if (obj && obj.type === PSO.Molecule.Structure.type && obj.data === this.state.structure) {
                this.sync();
            }
        });
    }

    private sync() {
        const structureOptions = getStructureOptions(this.plugin.state.data);
        if (arrayEqual(structureOptions.all, this.state.structureOptions.all)) return;
        this.setState(this.getInitialState());
    }

    private getStructure(ref: string) {
        const state = this.plugin.state.data;
        const cell = state.select(ref)[0];
        if (!ref || !cell || !cell.obj) return Structure.Empty;
        return (cell.obj as PSO.Molecule.Structure).data;
    }

    private getSequenceWrapper(params: MoleSequenceView['params']) {
        return {
            wrapper: getSequenceWrapper(this.state, this.plugin.managers.structure.selection),
            label: `${PD.optionLabel(params.chain, this.state.chainGroupId)}${PD.optionLabel(params.operatorName, "_" + this.state.operatorName)} | ${PD.optionLabel(params.entity, this.state.modelEntityId)}`,
            operatorName: '',
            chainName: '',
        };
    }

    private getSequenceWrappers(params: MoleSequenceView['params']) {
        if (this.state.mode === 'single') return [this.getSequenceWrapper(params)];

        const structure = this.getStructure(this.state.structureRef);
        const wrappers: { wrapper: (string | SequenceWrapper.Any), label: string, operatorName: string, chainName: string }[] = [];

        for (const [modelEntityId, eLabel] of getModelEntityOptions(structure, this.state.mode === 'polymers')) {
            for (const [chainGroupId, cLabel, chainName] of getChainOptions(structure, modelEntityId)) {
                for (const [operatorKey, operatorName] of getOperatorOptions(structure, modelEntityId, chainGroupId)) {
                    const wrapper = getSequenceWrapper({
                        structure,
                        modelEntityId,
                        chainGroupId,
                        operatorKey
                    }, this.plugin.managers.structure.selection);
                    if (wrapper instanceof PolymerSequenceWrapper || (wrapper instanceof HeteroSequenceWrapper && wrapper.residueLabel(0) !== 'HOH')) {
                        wrappers.push({
                            wrapper,
                            label: `${cLabel}${/\d/.test(operatorName) 
                                ? (operatorName).replace(/.*?(\d+).*/, "$1") === '1'
                                    ? ''
                                    : '_' + (operatorName).replace(/.*?(\d+).*/, "$1")
                                : ''} | ${eLabel}`,
                            operatorName,
                            chainName,
                        });
                    }
                    // if (wrappers.length > MaxSequenceWrappersCount) return wrappers;
                }
            }
        }
        return wrappers;
    }

    private getInitialState(): SequenceViewState {
        const structureOptions = getStructureOptions(this.plugin.state.data);
        const structureRef = structureOptions.options[0][0];
        const structure = this.getStructure(structureRef);
        let modelEntityId = getModelEntityOptions(structure)[0][0];
        let chainGroupId = getChainOptions(structure, modelEntityId)[0][0];
        let [operatorKey, operatorName] = getOperatorOptions(structure, modelEntityId, chainGroupId)[0];
        if (this.state.structure && this.state.structure === structure) {
            modelEntityId = this.state.modelEntityId;
            chainGroupId = this.state.chainGroupId;
            operatorKey = this.state.operatorKey;
            operatorName = this.state.operatorName;
        }
        return { structureOptions, structure, structureRef, modelEntityId, chainGroupId, operatorKey, mode: this.props.defaultMode ?? 'all', operatorName };
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
            mode: SequenceViewModeParam,
            operatorName: PD.Select(operatorOptions[0][1], operatorOptions, { shortLabel: true, twoColumns: true }),
        };
    }

    private get values(): PD.Values<MoleSequenceView['params']> {
        return {
            structure: this.state.structureRef,
            entity: this.state.modelEntityId,
            chain: this.state.chainGroupId,
            operator: this.state.operatorKey,
            mode: this.state.mode,
            operatorName: this.state.operatorName
        };
    }

    private setParamProps = (p: { param: PD.Base<any>, name: string, value: any }) => {
        const state = { ...this.state };
        switch (p.name) {
            case 'mode':
                state.mode = p.value;
                if (this.state.mode === state.mode) return;

                if (state.mode === 'all' || state.mode === 'polymers') {
                    break;
                }
            // eslint-disable-next-line no-fallthrough
            case 'structure':
                if (p.name === 'structure') state.structureRef = p.value;
                state.structure = this.getStructure(state.structureRef);
                state.modelEntityId = getModelEntityOptions(state.structure)[0][0];
                state.chainGroupId = getChainOptions(state.structure, state.modelEntityId)[0][0];
                state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                state.operatorName = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][1];
                break;
            case 'entity':
                state.modelEntityId = p.value;
                state.chainGroupId = getChainOptions(state.structure, state.modelEntityId)[0][0];
                state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                state.operatorName = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][1];
                break;
            case 'chain':
                state.chainGroupId = p.value;
                state.operatorKey = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][0];
                state.operatorName = getOperatorOptions(state.structure, state.modelEntityId, state.chainGroupId)[0][1];
                break;
            case 'operator':
                state.operatorKey = p.value;
                break;
        }
        this.setState(state);
    };

    render() {
        if (this.getStructure(this.state.structureRef) === Structure.Empty) {
            return <div className='msp-sequence'>
                <div className='msp-sequence-select'>
                    <Icon svg={HelpOutlineSvg} style={{ cursor: 'help', position: 'absolute', right: 0, top: 0 }}
                        title='Shows a sequence of one or more chains. Use the controls to alter selection.' />

                    <span>Sequence</span><span style={{ fontWeight: 'normal' }}>No structure available</span>
                </div>
            </div>;
        }

        const params = this.params;
        const values = this.values;
        const sequenceWrappers = this.getSequenceWrappers(params);

        return <div className='msp-sequence'>
            {/* <div className='msp-sequence-select'>
                <Icon svg={HelpOutlineSvg} style={{ cursor: 'help', position: 'absolute', right: 0, top: 0 }}
                    title='This shows a single sequence. Use the controls to show a different sequence.' />

                <span>Sequence of</span>
                <PureSelectControl title={`[Structure] ${PD.optionLabel(params.structure, values.structure)}`} param={params.structure} name='structure' value={values.structure} onChange={this.setParamProps} />
                <PureSelectControl title={`[Mode]`} param={SequenceViewModeParam} name='mode' value={values.mode} onChange={this.setParamProps} />
                {values.mode === 'single' && <PureSelectControl title={`[Entity] ${PD.optionLabel(params.entity, values.entity)}`} param={params.entity} name='entity' value={values.entity} onChange={this.setParamProps} />}
                {values.mode === 'single' && <PureSelectControl title={`[Chain] ${PD.optionLabel(params.chain, values.chain)}`} param={params.chain} name='chain' value={values.chain} onChange={this.setParamProps} />}
                {params.operator.options.length > 1 && <>
                    <PureSelectControl title={`[Instance] ${PD.optionLabel(params.operator, values.operator)}`} param={params.operator} name='operator' value={values.operator} onChange={this.setParamProps} />
                </>}
            </div> */}

            <NonEmptySequenceWrapper>
                {sequenceWrappers.map((s, i) => {
                    const elem = typeof s.wrapper === 'string'
                        ? <div key={i} className='msp-sequence-wrapper'>{s.wrapper}</div>
                        : <MoleSequence key={i} sequenceWrapper={s.wrapper} operatorName={s.operatorName} chainName={s.chainName}/>;

                    if (values.mode === 'single') return elem;

                    return <React.Fragment key={i}>
                        <div className='msp-sequence-chain-label'>{s.label}</div>
                        {elem}
                    </React.Fragment>;
                })}
            </NonEmptySequenceWrapper>
        </div>;
    }
}

function NonEmptySequenceWrapper({ children }: { children: React.ReactNode }) {
    return <div className='msp-sequence-wrapper-non-empty'>
        {children}
    </div>;
}
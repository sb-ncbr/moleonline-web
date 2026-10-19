import React from "react";
import { LayersInfo } from "../../../DataInterface";
import { SelectionHelper } from "../../CommonUtils/Selection";

declare function $(p: any): any;

// The layers of the selected channel a panel shows: the hovered layer, or the selected layers while there are some
export interface LayerSelectionState {
    data: LayersInfo[] | null,
    layerIds: number[],
    selectionOn: boolean
};

// How the shown layers follow the selection; null leaves them as they are
export const LayerSelection = {
    initial: (): LayerSelectionState => ({ data: null, layerIds: [], selectionOn: false }),
    channelSelected: (data: LayersInfo[]): LayerSelectionState => ({ data, layerIds: [], selectionOn: false }),
    channelDeselected: (): LayerSelectionState => ({ data: null, layerIds: [], selectionOn: false }),
    // a hovered layer is shown only while no layers are selected
    layerHovered: (state: LayerSelectionState, layerIdx: number): Pick<LayerSelectionState, "layerIds"> | null =>
        state.selectionOn ? null : { layerIds: [layerIdx] },
    layersSelected: (layerIds: number[]): Pick<LayerSelectionState, "layerIds" | "selectionOn"> =>
        ({ layerIds, selectionOn: layerIds.length > 0 }),
};

// A panel showing the layers of the selected channel; it only renders them
export abstract class LayerSelectionPanel extends React.Component<{}, LayerSelectionState> {
    state: LayerSelectionState = LayerSelection.initial();

    private unsubscribe: (() => void)[] = [];
    private resizeTimer: number | undefined;

    componentDidMount() {
        this.unsubscribe.push(
            SelectionHelper.attachOnChannelDeselectHandler(() => this.setState(LayerSelection.channelDeselected())),
            SelectionHelper.attachOnChannelSelectHandler(data => this.setState(LayerSelection.channelSelected(data.LayersInfo))),
        );

        $(window).on('layerTriggered', this.layerTriggerHandler);
        $(window).on('layerSelected', this.layerSelectedHandler);
        this.unsubscribe.push(() => {
            $(window).off('layerTriggered', this.layerTriggerHandler);
            $(window).off('layerSelected', this.layerSelectedHandler);
        });
    }

    componentWillUnmount() {
        this.unsubscribe.forEach(u => u());
        this.unsubscribe = [];
        window.clearTimeout(this.resizeTimer);
    }

    private layerTriggerHandler = (event: any, layerIdx: number) => {
        const change = LayerSelection.layerHovered(this.state, layerIdx);
        if (change !== null) {
            this.setState(change, this.resizeContent);
        }
    }

    private layerSelectedHandler = (event: any, data: { layerIds: number[] }) => {
        this.setState(LayerSelection.layersSelected(data.layerIds), this.resizeContent);
    }

    private resizeContent = () => {
        window.clearTimeout(this.resizeTimer);
        this.resizeTimer = window.setTimeout(() => $(window).trigger('contentResize'), 1);
    }
}

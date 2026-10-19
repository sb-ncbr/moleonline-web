import { describe, expect, it } from "vitest";
import { LayerSelection, LayerSelectionState } from "./LayerSelection";
import { LayersInfo } from "../../../DataInterface";

const layers = (n: number) => Array.from({ length: n }, () => ({}) as LayersInfo);
const apply = (state: LayerSelectionState, change: Partial<LayerSelectionState> | null) => ({ ...state, ...change });

describe("layer selection", () => {
    it("shows a hovered layer", () => {
        const state = LayerSelection.channelSelected(layers(3));
        expect(apply(state, LayerSelection.layerHovered(state, 2)).layerIds).toEqual([2]);
    });

    it("keeps the selected layers while another layer is hovered", () => {
        let state = LayerSelection.channelSelected(layers(3));
        state = apply(state, LayerSelection.layersSelected([1]));
        expect(LayerSelection.layerHovered(state, 2)).toBeNull();
    });

    it("follows hovered layers again after the channel changes", () => {
        let state = LayerSelection.channelSelected(layers(3));
        state = apply(state, LayerSelection.layersSelected([1]));
        state = LayerSelection.channelSelected(layers(4));
        expect(apply(state, LayerSelection.layerHovered(state, 3)).layerIds).toEqual([3]);
    });

    it("follows hovered layers again after the channel is deselected and another selected", () => {
        let state = LayerSelection.channelSelected(layers(3));
        state = apply(state, LayerSelection.layersSelected([1]));
        state = LayerSelection.channelDeselected();
        expect(state).toEqual(LayerSelection.initial());
        state = LayerSelection.channelSelected(layers(3));
        expect(apply(state, LayerSelection.layerHovered(state, 0)).layerIds).toEqual([0]);
    });

    it("follows hovered layers again once no layers are selected", () => {
        let state = LayerSelection.channelSelected(layers(3));
        state = apply(state, LayerSelection.layersSelected([1]));
        state = apply(state, LayerSelection.layersSelected([]));
        expect(apply(state, LayerSelection.layerHovered(state, 2)).layerIds).toEqual([2]);
    });
});

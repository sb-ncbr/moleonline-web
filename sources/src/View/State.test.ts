import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tunnel, TunnelMetaInfo } from "../DataInterface";

// the plugin is stubbed: each render resolves when the test says so
const plugin = vi.hoisted(() => ({
    pending: [] as { resolve: () => void, reject: (e: unknown) => void }[],
    rendered: new Set<string>(),
    nextRef: 0,
}));

vi.mock("./Context", () => {
    const render = () => new Promise<[unknown, string]>((resolve, reject) => {
        const ref = `ref${plugin.nextRef++}`;
        plugin.pending.push({
            resolve: () => { plugin.rendered.add(ref); resolve([{}, ref]); },
            reject,
        });
    });
    return { Context: { getInstance: () => ({ plugin: { state: { data: {} } }, renderTunnel: render, renderPropertyColorTunnel: render }) } };
});

vi.mock("molstar/lib/mol-plugin/commands", () => ({
    PluginCommands: { State: { RemoveObject: async (_: unknown, { ref }: { ref: string }) => { plugin.rendered.delete(ref); } } },
}));

// no 2D view to highlight
vi.stubGlobal("document", { getElementById: () => null });

const { showChannelVisuals, showChannelPropertyColorVisuals } = await import("./State");

type Channel = Tunnel & TunnelMetaInfo;
const channel = () => ({ Id: "c1", __color: 0 } as unknown as Channel);

// resolves each render once it is requested, until the operations finish
async function settle(...operations: Promise<unknown>[]) {
    let done = false;
    const all = Promise.allSettled(operations).finally(() => { done = true; });
    while (!done) {
        await new Promise(r => setTimeout(r, 0));
        plugin.pending.shift()?.resolve();
    }
    for (const result of await all) {
        if (result.status === "rejected") throw result.reason;
    }
}

describe("channel visual operations", () => {
    beforeEach(() => {
        plugin.pending = [];
        plugin.rendered.clear();
        plugin.nextRef = 0;
    });

    it("renders a channel shown twice at once only once", async () => {
        const c = channel();
        await settle(showChannelVisuals([c], true), showChannelVisuals([c], true));
        expect([...plugin.rendered]).toEqual([c.__ref]);

        await showChannelVisuals([c], false);
        expect(plugin.rendered.size).toBe(0);
        expect(c.__isVisible).toBe(false);
    });

    it("keeps only the last visual of overlapping repaints", async () => {
        const c = channel();
        await settle(showChannelVisuals([c], true));
        await settle(showChannelVisuals([c], true, true), showChannelPropertyColorVisuals(c, {} as any, true), showChannelVisuals([c], true, true));
        expect([...plugin.rendered]).toEqual([c.__ref]);
    });

    it("leaves a channel whose render failed hidden and showable", async () => {
        const c = channel();
        const failed = showChannelVisuals([c], true);
        await new Promise(r => setTimeout(r, 0));
        plugin.pending.shift()!.reject(new Error("render failed"));
        await expect(failed).rejects.toThrow("render failed");
        expect(c.__isVisible).toBeFalsy();
        expect(c.__isBusy).toBe(false);

        await settle(showChannelVisuals([c], true));
        expect([...plugin.rendered]).toEqual([c.__ref]);
        expect(c.__isVisible).toBe(true);
    });
});

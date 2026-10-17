import { beforeEach, describe, expect, it, vi } from 'vitest';

// ChannelsDB and the loaded structure, replaced: each test sets what the requests answer
const api = vi.hoisted(() => ({
    getChannelsData: vi.fn(),
    getProteinData: vi.fn(),
}));
vi.mock('./ChannelsDBAPIService', () => ({ ApiService: api }));
vi.mock('./View/Context', () => ({ Context: { getInstance: () => ({ getStructureChains: () => Promise.resolve(null) }) } }));

const channels = { channelsAnnotations: new Map(), channelsData: { Tunnels: [] } };
const protein = { residueData: new Map() };

// The cache keeps its state in static fields: fresh modules for every test, and the RequestError of the same
// modules, for the cache's instanceof checks
async function freshCache() {
    vi.resetModules();
    return { cache: (await import('./Cache')).ChannelsDBData, RequestError: (await import('./Http')).RequestError };
}

describe('ChannelsDBData', () => {
    beforeEach(() => {
        api.getChannelsData.mockReset();
        api.getProteinData.mockReset();
    });

    it('shares one request between callers asking at the same time', async () => {
        const { cache } = await freshCache();
        api.getChannelsData.mockResolvedValue(channels);
        api.getProteinData.mockResolvedValue(protein);
        const [data, annotations] = await Promise.all([cache.getChannelsData('1tqn'), cache.getChannelsAnnotations('1tqn')]);
        expect(data).toBe(channels.channelsData);
        expect(annotations).toBe(channels.channelsAnnotations);
        expect(api.getChannelsData).toHaveBeenCalledTimes(1);
        expect(api.getProteinData).toHaveBeenCalledTimes(1);
    });

    it('does not ask again after ChannelsDB refused the entry', async () => {
        const { cache, RequestError } = await freshCache();
        api.getChannelsData.mockRejectedValue(new RequestError('not found', 404, false));
        api.getProteinData.mockResolvedValue(protein);
        await expect(cache.getChannelsData('2bfu')).rejects.toThrow('not found');
        await expect(cache.getChannelsData('2bfu')).rejects.toThrow('not found');
        expect(api.getChannelsData).toHaveBeenCalledTimes(1);
    });

    it('asks again after a network or server error', async () => {
        const { cache } = await freshCache();
        api.getChannelsData.mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValue(channels);
        api.getProteinData.mockResolvedValue(protein);
        await expect(cache.getChannelsData('1a8r')).rejects.toThrow('Failed to fetch');
        await expect(cache.getChannelsData('1a8r')).resolves.toBe(channels.channelsData);
        expect(api.getChannelsData).toHaveBeenCalledTimes(2);
    });

    it.each([500, 503, 408, 429])('asks again after HTTP %i', async status => {
        const { cache, RequestError } = await freshCache();
        api.getChannelsData.mockRejectedValueOnce(new RequestError('try later', status, false)).mockResolvedValue(channels);
        api.getProteinData.mockResolvedValue(protein);
        await expect(cache.getChannelsData('1a8r')).rejects.toThrow('try later');
        await expect(cache.getChannelsData('1a8r')).resolves.toBe(channels.channelsData);
        expect(api.getChannelsData).toHaveBeenCalledTimes(2);
    });

    it('keeps the request of another entry when an older one fails afterwards', async () => {
        const { cache } = await freshCache();
        let failOld!: (e: unknown) => void;
        api.getChannelsData
            .mockReturnValueOnce(new Promise((_, rej) => failOld = rej))
            .mockResolvedValue(channels);
        api.getProteinData.mockResolvedValue(protein);
        const old = cache.getChannelsData('1aaa');
        await expect(cache.getChannelsData('1bbb')).resolves.toBe(channels.channelsData);
        failOld(new TypeError('Failed to fetch'));
        await expect(old).rejects.toThrow('Failed to fetch');
        await cache.getChannelsData('1bbb');
        expect(api.getChannelsData).toHaveBeenCalledTimes(2); // 1aaa once, 1bbb once
    });

    it('fails the load when the protein data fail, without an unhandled rejection', async () => {
        const { cache, RequestError } = await freshCache();
        api.getChannelsData.mockResolvedValue(channels);
        api.getProteinData.mockRejectedValue(new RequestError('server error', 500, false));
        await expect(cache.getChannelsData('1tqn')).rejects.toThrow('server error');
    });
});

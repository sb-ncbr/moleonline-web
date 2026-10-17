import { CommonOptions } from "../config/common";
import { ApiService, CompInfo, InitResponse, CSAResidues, Cofactors } from "./MoleAPIService";
import { describeError, isRefused } from "./Http";
import {Tunnel} from "./DataInterface";

type DataHandler<T> = (key: string, data: T) => void;
type DataErrorHandler = (key: string, error: string) => void;

// Caches API data per key and notifies handlers once it arrives.
// Concurrent requests for a key share one fetch; only network and server errors are retried (with backoff),
// a request the API refuses (e.g. 404 unknown computation) fails at once, and handler exceptions are not
// treated as request failures.
class KeyedDataProvider<T> {
    private static readonly MAX_RETRIES = 5;
    private data = new Map<string, T>();
    private handlers: { key: string, handler: DataHandler<T>, onError?: DataErrorHandler, stayForUpdate: boolean }[] = [];
    private pending = new Set<string>();

    constructor(
        private fetch: (key: string) => Promise<T>,
        private failedMessage: string,
    ) { }

    public get(key: string, handler: DataHandler<T>, onlyFresh?: boolean, onError?: DataErrorHandler) {
        const data = this.data.get(key);
        if (data !== void 0 && !onlyFresh) {
            handler(key, data);
            return;
        }
        this.attachHandler(key, handler, false, onError);
    }

    public subscribe(key: string, handler: DataHandler<T>, onlyFresh?: boolean) {
        const data = this.data.get(key);
        if (data !== void 0 && !onlyFresh) {
            handler(key, data);
        }
        this.attachHandler(key, handler, true);
    }

    private attachHandler(key: string, handler: DataHandler<T>, stayForUpdate: boolean, onError?: DataErrorHandler) {
        this.handlers.push({ key, handler, onError, stayForUpdate });
        if (!this.pending.has(key)) {
            this.pending.add(key);
            this.fetchData(key, 0);
        }
    }

    private fetchData(key: string, attempt: number) {
        this.fetch(key).then((val) => {
            this.pending.delete(key);
            if (CommonOptions.DEBUG_MODE)
                console.log(val);
            this.data.set(key, val);
            this.runHandlers(key, val);
        }, (err) => {
            if (CommonOptions.DEBUG_MODE)
                console.log(err);
            if (!isRefused(err) && attempt < KeyedDataProvider.MAX_RETRIES) {
                window.setTimeout(() => this.fetchData(key, attempt + 1), 500 * 2 ** attempt);
            } else {
                this.pending.delete(key);
                this.runErrorHandlers(key, describeError(err, this.failedMessage));
            }
        });
    }

    private runHandlers(key: string, data: T) {
        const current = this.handlers.filter(h => h.key === key);
        this.handlers = this.handlers.filter(h => h.key !== key || h.stayForUpdate);
        for (const h of current) {
            h.handler(key, data);
        }
    }

    private runErrorHandlers(key: string, error: string) {
        const failed = this.handlers.filter(h => h.key === key);
        this.handlers = this.handlers.filter(h => h.key !== key || h.stayForUpdate);
        for (const h of failed) {
            h.onError?.(key, error);
        }
    }
}

export namespace ComputationInfo {
    export const DataProvider = new KeyedDataProvider<CompInfo>(
        compId => ApiService.getComputationInfoList(compId),
        'Could not load computation info from the MOLE API.',
    );

    // The cached computation info as a promise; rejects with the message for the user
    export function get(computationId: string): Promise<CompInfo> {
        return new Promise((res, rej) => DataProvider.get(computationId, (_compId, info) => res(info), false, (_compId, error) => rej(error)));
    }
}

export namespace JobStatus {
    export type OnStatusChangeHandler = (status: InitResponse) => void;
    export type OnErrHandler = (err: any) => void;
    export class Watcher {
        private static handlers: Map<String, OnStatusChangeHandler[]>
        private static errHandlers: Map<String, OnErrHandler[]>
        private static makeHash(computationId: string, submitId: number) {
            return `${computationId}:${submitId}`;
        }

        private static registerErrHandler(computationId: string, submitId: number, handler: OnErrHandler) {
            if (this.errHandlers === void 0) {
                this.errHandlers = new Map<string, OnErrHandler[]>();
            }
            let key = this.makeHash(computationId, submitId);
            let handlers = this.errHandlers.get(key);

            if (handlers === void 0) {
                handlers = [];
            }

            handlers.push(
                handler
            );
            this.errHandlers.set(key, handlers);
        }

        public static registerOnChangeHandler(computationId: string, submitId: number, handler: OnStatusChangeHandler, onErr: OnErrHandler) {
            if (this.handlers === void 0) {
                this.handlers = new Map<string, OnStatusChangeHandler[]>();
            }
            let key = this.makeHash(computationId, submitId);
            let handlers = this.handlers.get(key);
            let shouldStartLoop = false;
            if (handlers === void 0) {
                handlers = [];
                shouldStartLoop = true;
            }

            handlers.push(
                handler
            );
            this.handlers.set(key, handlers);

            this.registerErrHandler(computationId, submitId, onErr);

            if (shouldStartLoop) {
                this.waitForResult(computationId, submitId);
            }
        }

        private static notifyStatusUpdate(computationId: string, submitId: number, status: InitResponse) {
            let handlers = this.handlers.get(this.makeHash(computationId, submitId));
            if (handlers === void 0) {
                return;
            }

            // a failing subscriber must not stop the others, nor the polling and its cleanup
            for (let h of handlers) {
                try {
                    h(status);
                } catch (e) {
                    console.error(`Status handler of ${computationId}:${submitId} failed`, e);
                }
            }
        }

        private static removeHandlers(computationId: string, submitId: number) {
            let key = this.makeHash(computationId, submitId);
            this.handlers.delete(key);
            this.errHandlers.delete(key);
        }

        // Poll often at first, then less often for long jobs
        private static readonly FIRST_POLL_MS = 1000;
        private static readonly MAX_POLL_MS = 5000;
        // A status request that fails on the network or the server is retried after 2, 4, 8, 16 and 30 s
        // before the error is reported
        private static readonly MAX_RETRIES = 5;
        private static readonly MAX_RETRY_MS = 30000;

        private static waitForResult(computationId: string, submitId: number, pollMs = Watcher.FIRST_POLL_MS, failures = 0) {
            ApiService.getStatus(computationId, submitId).then((state) => {
                if (CommonOptions.DEBUG_MODE)
                    console.log(state);
                switch (state.Status) {
                    case "Initializing":
                    case "Running":
                        this.notifyStatusUpdate(computationId, submitId, state);
                        window.setTimeout(() => {
                            this.waitForResult(computationId, submitId, Math.min(pollMs * 1.5, Watcher.MAX_POLL_MS));
                        }, pollMs);
                        break;
                    case "Initialized":
                    case "FailedInitialization":
                    case "Error":
                    case "Deleted":
                    case "Aborted":
                    case "Finished":
                        this.notifyStatusUpdate(computationId, submitId, state);
                        this.removeHandlers(computationId, submitId);
                        break;
                }
            }, (err) => { // only a failed request is retried, not an error in the code above
                // a refused request (404 unknown computation or submission, 410 deleted) is final
                if (!isRefused(err) && failures < Watcher.MAX_RETRIES) {
                    const retryMs = Math.min(2000 * 2 ** failures, Watcher.MAX_RETRY_MS);
                    if (CommonOptions.DEBUG_MODE)
                        console.log(`Status of ${computationId}:${submitId} not available, retrying in ${retryMs} ms`, err);
                    window.setTimeout(() => {
                        this.waitForResult(computationId, submitId, pollMs, failures + 1);
                    }, retryMs);
                    return;
                }

                // give up; a new registration starts polling again
                let h = this.errHandlers.get(this.makeHash(computationId, submitId));
                this.removeHandlers(computationId, submitId);
                if (h === void 0) {
                    throw new Error(err);
                }

                for (let handler of h) {
                    handler(err);
                }
            });
        }
    }
}

export namespace DataProxyCSAResidues {
    export const DataProvider = new KeyedDataProvider<CSAResidues>(
        compId => ApiService.getCSAResidues(compId),
        'Could not load CSA residues from the MOLE API.',
    );
}

export namespace DataProxyCofactors {
    const provider = new KeyedDataProvider<Cofactors>(
        () => ApiService.getCofactors(),
        'Could not load cofactors from the MOLE API.',
    );

    export const DataProvider = {
        get(handler: (info: Cofactors) => void, onlyFresh?: boolean) {
            provider.get('', (_key, info) => handler(info), onlyFresh);
        },
    };
}

export namespace TwoDProts {
    export type OnStatusChangeHandler = (status: string, jobId: string, errorMsg: string) => void;
    export type OnErrorHandler = (err: any) => void;

    export class Watcher {
        private static baseURL = 'https://2dprots.ncbr.muni.cz/api/v1/custom_protein';
        private static statusURL = (jobId: string) => `https://2dprots.ncbr.muni.cz/api/v1/custom_protein/${jobId}`;
        private static activeMonitors: Map<string, boolean> = new Map();

        public static async startJob(
            proteinUrl: string,
            channels: (Tunnel)[], // Local channels object
            onStatusChange: OnStatusChangeHandler,
            onError: OnErrorHandler
        ) {
            try {
                // Start the job
                const response = await fetch(this.baseURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        protein_url: proteinUrl,
                        channels: channels,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to start job. Status: ${response.status}`);
                }

                const data = await response.json();

                if (!data.job_id) {
                    throw new Error('Job ID not found in response.');
                }

                const jobId = data.job_id;

                // Begin monitoring the job
                this.activeMonitors.set(jobId, true); // Mark the monitor as active
                this.monitorJob(jobId, onStatusChange, onError);
            } catch (error) {
                onError(error);
            }
        }

        private static async monitorJob(
            jobId: string,
            onStatusChange: OnStatusChangeHandler,
            onError: OnErrorHandler
        ) {
            const checkStatus = async () => {
                if (!this.activeMonitors.get(jobId)) {
                    // Stop monitoring if the job is "killed"
                    console.log(`Monitoring stopped for job ${jobId}`);
                    return;
                }

                try {
                    const response = await fetch(this.statusURL(jobId));
                    if (!response.ok) {
                        throw new Error(`Failed to fetch status. Status: ${response.status}`);
                    }

                    const data = await response.json();
                    const jobState = data.job_state;
                    const errorMsg = data.job_error;

                    onStatusChange(jobState, jobId, errorMsg);

                    if (jobState === 'SUCCESS' || jobState === 'FAILURE') {
                        // Job finished, stop monitoring
                        this.activeMonitors.delete(jobId);
                        return;
                    }

                    // Wait 1 second before checking status again
                    setTimeout(checkStatus, 1000);
                } catch (err) {
                    onError(err);
                }
            };

            // Start the status check loop
            checkStatus();
        }

        public static stopMonitoring(jobId: string) {
            // Stop the monitoring loop for the given job ID
            if (this.activeMonitors.has(jobId)) {
                this.activeMonitors.set(jobId, false);
                console.log(`Job monitoring manually stopped for job ID: ${jobId}`);
            } else {
                console.warn(`No active monitoring found for job ID: ${jobId}`);
            }
        }

    }
}
import React from "react";
import { TwoDProts as TwoDProtsProxy } from "../../../DataProxy";
import { getParameters } from "../../../Common/Util/Router";
import { TwoDProtsBridge } from "../../CommonUtils/TwoDProtsBridge";
import { Events } from "../../../Bridge";
import { SelectionHelper } from "../../CommonUtils/Selection";
import { Tunnel, TunnelMetaInfo } from "../../../DataInterface";
import { LastVisibleChannels } from "../../../Cache";
import { Color } from "molstar/lib/mol-util/color";

function highlightElement(elementId: string, highlightColour: string): void {
    const svgContainer = document.getElementById('svgContainer');
    if (!svgContainer) return;

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(elementId)}`);
    if (!targetElement) return;

    targetElement.dataset.hoverOriginalFill = targetElement.style.fill || '';
    targetElement.dataset.hoverOriginalOpacity = targetElement.style.opacity || '';

    targetElement.style.fill = highlightColour;
    targetElement.style.stroke = highlightColour;
    targetElement.style.opacity = '1';
}

function unhighlightElement(elementId: string): void {
    const svgContainer = document.getElementById('svgContainer');
    if (!svgContainer) return;

    const svgElement = svgContainer.querySelector('svg');
    if (!svgElement) return;

    const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(elementId)}`);
    if (!targetElement) return;

    const originalFill = targetElement.dataset.hoverOriginalFill || '';
    const originalOpacity = targetElement.dataset.hoverOriginalOpacity || '';

    targetElement.style.fill = originalFill;
    targetElement.style.stroke = originalFill;
    targetElement.style.opacity = originalOpacity;

    delete targetElement.dataset.hoverOriginalFill;
    delete targetElement.dataset.hoverOriginalOpacity;
}

function sortElements(elements: Element[]) {
    return elements.sort((a, b) => {
        const idA = a.getAttribute('id');
        const idB = b.getAttribute('id');

        // Function to get sort key
        function getSortKey(id: string): [number, string] {
            const firstChar = id.charAt(0);
            const isLowerCase = firstChar >= 'a' && firstChar <= 'z' ? 1 : 0;
            return [isLowerCase, id];
        }

        const keyA = getSortKey(idA!);
        const keyB = getSortKey(idB!);

        if (keyA[0] !== keyB[0]) {
            return keyA[0] - keyB[0]; // Capital letters come first
        } else {
            if (idA === null || idB === null) {
                return 0;
            }
            return idA?.localeCompare(idB!);
        }
    });
}

export class TwoDProts extends React.Component<{}, { isComputing: boolean, error?: any, jobId: string, canceled: boolean, modifiedSVG: string, selectedTunnel: string }> {
    state = { isComputing: false, error: void 0, jobId: "", canceled: false, modifiedSVG: "", selectedTunnel: "" };
    private svgContainerRef = React.createRef<HTMLDivElement>();

    private onChannelSelect = (channel: Tunnel & TunnelMetaInfo) => {
        if (this.state.modifiedSVG !== "") {
            const svgElement = document.getElementById('svgContainer');
            const targetElement = svgElement ? svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${TwoDProtsBridge.getFromIdTable(channel.Id)}`)}`) : null;
    
            if (this.state.selectedTunnel !== channel.Id) {
                if (this.state.selectedTunnel !== "") {
                    const oldElement = svgElement ? svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${TwoDProtsBridge.getFromIdTable(this.state.selectedTunnel)}`)}`) : null;
                    if (oldElement) {
                        const originalFill = oldElement.dataset.selectOriginalFill || oldElement.style.fill || '';
                        oldElement.dataset.hoverOriginalFill = oldElement.dataset.selectOriginalFill || oldElement.style.fill || '';
                        oldElement.style.fill = originalFill;
                        oldElement.style.stroke = originalFill;
                        delete oldElement.dataset.selectOriginalFill;
                    }
                }
    
                if (targetElement) {
                    targetElement.dataset.selectOriginalFill = targetElement.dataset.hoverOriginalFill || targetElement.style.fill || '';
                    targetElement.style.fill = '#FF00FF';
                    targetElement.style.stroke = '#FF00FF';
                    targetElement.dataset.hoverOriginalFill = targetElement.style.fill || '';
                }
    
                this.setState({ selectedTunnel: channel.Id });
            }
        }
    };

    private onChannelColorChanged = (channel: Tunnel & TunnelMetaInfo) => {
        if (this.state.modifiedSVG !== "") {
            const svgElement = document.getElementById('svgContainer');
            const targetElement = svgElement ? svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${TwoDProtsBridge.getFromIdTable(channel.Id)}`)}`) : null;
            if (targetElement) {
                const color = Color.toHexStyle(channel.__color);
                targetElement.dataset.selectOriginalFill = color;
                targetElement.dataset.hoverOriginalFill = color;
                targetElement.style.fill = color;
                targetElement.style.stroke = color;
            }
        }
    }

    componentDidMount() {
        SelectionHelper.attachOnChannelSelectHandler2(this.onChannelSelect.bind(this));
        SelectionHelper.attachOnChannelDeselectHandler(() => {
            if (this.state.modifiedSVG !== "" && this.state.selectedTunnel !== "") {
                const svgElement = document.getElementById('svgContainer');
                const targetElement = svgElement ? svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${TwoDProtsBridge.getFromIdTable(this.state.selectedTunnel)}`)}`) : null;
                if (targetElement) {
                    const originalFill = targetElement.dataset.selectOriginalFill || '';
                    targetElement.style.fill = originalFill;
                    targetElement.style.stroke = originalFill;
                    targetElement.dataset.hoverOriginalFill = originalFill;
                    delete targetElement.dataset.selectOriginalFill;
                }
                this.setState({ selectedTunnel: "" })
            }
        })
        TwoDProtsBridge.attachOnColorTunnelChangeHandler(this.onChannelColorChanged.bind(this))
    }

    private getLastErrorMessage(message: string): string {
        const lastColonIndex = message.lastIndexOf(':');
        if (lastColonIndex === -1) {
            return message;
        }
        return message.substring(lastColonIndex + 1).trim();
    }

    private addSvgHoverListeners(elements: Element[]) {
        elements.forEach((element) => {
            const elementId = element.getAttribute('id');
            if (elementId) {
                element.addEventListener('mouseover', () => {
                    highlightElement(elementId, '#FF00FF');
                });

                element.addEventListener('mouseout', () => {
                    unhighlightElement(elementId);
                });
            }

        });
    }

    private addSvgClickListeners(elements: Element[]) {
        const tunnels = LastVisibleChannels.get();
        elements.forEach((element) => {
            const elementId = element.getAttribute('id');
            if (elementId) {
                element.addEventListener('click', () => {
                    const filteredTunnels = tunnels.filter((t) => TwoDProtsBridge.getFromIdTable(t.Id) === elementId);
                    if (filteredTunnels.length > 0) {
                        const tunnel = filteredTunnels[0];
                        if (this.state.selectedTunnel === tunnel.Id) {
                            SelectionHelper.forceDeselectChannel();
                        } else {
                            SelectionHelper.selectTunnel(tunnel);
                        }
                    }
                })
            }
        })
    }

    private processSvg() {
        const svgElement = document.getElementById('svgContainer')?.querySelector('svg');

        if (!svgElement) {
            alert('The loaded content is not a valid SVG.');
            return;
        }

        let svgTunnels = sortElements(Array.from(svgElement.querySelectorAll('g.tunnel')));
        let tunnels = LastVisibleChannels.get();

        for (const tunnel of tunnels) {
            const targetElement = svgElement.querySelector<SVGGElement>(`g#${CSS.escape(`${TwoDProtsBridge.getFromIdTable(tunnel.Id)}`)}`);
            if (targetElement) {
                targetElement.style.fill = Color.toHexStyle(tunnel.__color);
                targetElement.style.stroke = Color.toHexStyle(tunnel.__color);
            }
        }
        
        this.addSvgHoverListeners(svgTunnels);
        this.addSvgClickListeners(svgTunnels);
    }

    private async startComputation() {
        this.setState({canceled: false});
        let params = getParameters();
        if (params === null) {
            this.setState({ isComputing: false, jobId: '', error: `Cannot get structure url` });
            return;
        }
        const submitId = params.submitId;
        const computationId = params.computationId;
        try {
            TwoDProtsProxy.Watcher.startJob(
                `https://api.mole.upol.cz/Data/${computationId}?submitId=${submitId}&format=molecule`,
                TwoDProtsBridge.getVizualizedChannels(),
                (status, jobId, errorMsg) => {
                    console.log(`2DProts Job Status: ${status}`);
                    if (status === 'SUCCESS') {
                        this.setState({ isComputing: false, jobId });
                        this.loadSvg()
                            .then(() => new Promise<void>(resolve => setTimeout(resolve, 100)))
                            .then(() => {
                                this.processSvg()
                            });
                    } else if (status === 'FAILURE') {
                        this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">{this.getLastErrorMessage(errorMsg)}</div> })
                    } else if (status === 'PENDING' && this.state.jobId === '') {
                        this.setState({ jobId });
                    }
                },
                (error => {
                    this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error.message}</div> })
                })
            )
        } catch (error) {
            console.error('Error sending JSON to backend:', error);
            this.setState({ isComputing: false, jobId: '', error: <div className="text-danger">Error: {error.message}</div> })
        }
    }

    private async cancelComputation() {
        if (this.state.jobId !== '') {
            let state = this.state;
            state.error = void 0;
            state.isComputing = false;
            state.jobId = '';
            state.canceled = true;
            this.setState(state);
            TwoDProtsProxy.Watcher.stopMonitoring(this.state.jobId);
        }
    }

    private async fetchSvgAndCreateBlob(svgUrl: string) {
        try {
            const response = await fetch(svgUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch SVG: ${response.status} ${response.statusText}`);
            }
            const svgText = await response.text();
            return new Blob([svgText], {type: 'image/svg+xml'});
        } catch (error) {
            Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `Error while delivering 2DProts SVG: ${error}`
            })
        }
    }

    private async loadSvg() {
        const svgUrl = `https://2dprots.ncbr.muni.cz/static/2DProt/custom_jobs/${this.state.jobId}/output.svg`;

        try {
            const response = await fetch(svgUrl);
            if (!response.ok) throw new Error('Failed to load SVG');

            const svgText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            const inlineSvg = doc.documentElement as unknown as SVGSVGElement;

            inlineSvg.style.height = '95%';
            inlineSvg.style.width = '100%';
            inlineSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet')

            const tunnelElements = inlineSvg.querySelectorAll('.tunnel');
            tunnelElements.forEach(element => {
                element.setAttribute('style', 'fill: black; stroke: black; opacity: 0.9');
            });

            const serializer = new XMLSerializer();
            const modifiedSVG = serializer.serializeToString(inlineSvg);

            const encodedSVG = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(modifiedSVG)}`;

            this.setState({ modifiedSVG: encodedSVG })

            if (this.svgContainerRef.current) {
                this.svgContainerRef.current.innerHTML = '';
                this.svgContainerRef.current.appendChild(inlineSvg);

                if (!inlineSvg.getAttribute('viewBox')) {
                    const bbox = inlineSvg.getBBox();
                    inlineSvg.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                }

            }
        } catch (error) {
            Events.invokeNotifyMessage({
                messageType: "Danger",
                message: `Error while delivering 2DProts SVG: ${error}`
            })
            console.error("Error modifying SVG:", error);
        }
    }

    private createSvgBlobFromContainer = () => {
        const svgContainer = this.svgContainerRef.current;
        if (!svgContainer) return null;
    
        const svgElement = svgContainer.querySelector('svg');
        if (!svgElement) return null;
    
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);
    
        const fullSvgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;
    
        const blob = new Blob([fullSvgString], { type: 'image/svg+xml' });
        return blob;
    };

    render() {
        return <div className="d-flex flex-column justify-content-center align-items-center h-100 w-100">
            <div ref={this.svgContainerRef} id="svgContainer"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', maxHeight: '90%', overflow: 'visible' }}
            >
            </div>
            {this.state.isComputing ?
                <div>
                    <button className="btn btn-primary" type="button" style={{ marginRight: '10px' }} disabled>
                        <span className="spinner-border spinner-border-sm" aria-hidden="true"></span>
                        <span role="status">Loading...</span>
                    </button>
                    <button className="btn btn-primary" type="button" onClick={() => { this.cancelComputation(); }}>
                        <span role="status">Cancel</span>
                    </button>
                </div>
                : this.state.jobId === '' || this.state.canceled ?
                    <button type="button" className="btn btn-primary" onClick={() => { this.setState({ isComputing: true, error: void 0 }); this.startComputation(); }}>
                        <span>Start computation</span>
                    </button>
                    :
                    <div>
                        <button type="button" className="btn btn-primary" onClick={() => { this.setState({ isComputing: true, error: void 0 }); this.startComputation(); }}>
                            <span>Start computation</span>
                        </button>
                        <button className="btn btn-primary" type="button" style={{ marginLeft: '10px' }} onClick={() => {
                            const blob = this.createSvgBlobFromContainer();
                            if (blob) {
                                const blobUrl = URL.createObjectURL(blob);
                                const downloadLink = document.createElement('a');
                                downloadLink.href = blobUrl;
                                downloadLink.download = 'output.svg';
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                document.body.removeChild(downloadLink);
                            }
                        }}>Download SVG</button>
                    </div>
            }
            {this.state.error ?? <></>}
        </div>
    }
}
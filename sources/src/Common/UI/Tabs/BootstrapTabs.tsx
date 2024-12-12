import React from "react";

export interface TabbedContainerProps {
    tabContents: JSX.Element[],
    header: string[],
    namespace: string,
    htmlId?: string,
    htmlClassName?: string,
    activeTab: number
    onChange?: (tabIdx: number) => void
}
export class TabbedContainer extends React.Component<TabbedContainerProps, {}> {

    componentDidMount() {
    }

    header() {
        let rv: JSX.Element[] = [];
        for (let idx = 0; idx < this.props.header.length; idx++) {
            let header = this.props.header[idx];
            rv.push(<li className={(idx === this.props.activeTab) ? "nav-item active" : "nav-item"}><a id={`${this.props.namespace}${idx + 1}-tab`} className={(idx === this.props.activeTab) ? "nav-link active" : "nav-link"} aria-current="page" data-bs-toggle="tab" href={`#${this.props.namespace}${idx + 1}`} onClick={(() => {
                window.setTimeout(() => {
                    if (this.props.onChange !== void 0) {
                        this.props.onChange(idx);
                    }
                });
            }).bind(this)}>{header}</a></li>);
        }
        return rv;
    }

    contents() {
        let rv: JSX.Element[] = [];
        for (let idx = 0; idx < this.props.tabContents.length; idx++) {
            let contents = this.props.tabContents[idx];
            rv.push(
                <div id={`${this.props.namespace}${idx + 1}`} className={`tab-pane ${(idx === this.props.activeTab) ? " show active" : ""}`} /*style={{display: (idx === this.props.activeTab) ? "block" : "none"}}*/ role="tabpanel" aria-labelledby={`${this.props.namespace}${idx + 1}-tab`}>
                    {contents}
                </div>
            );
        }
        return rv;
    }

    render() {
        return (
            <div className={this.props.htmlClassName} id={this.props.htmlId}>
                <ul className="nav nav-tabs">
                    {this.header()}
                </ul>
                <div className="tab-content">
                    {this.contents()}
                </div>
            </div>
        );
    }
}

export class Tab extends React.Component<{ active: boolean, tabIndex: number, contents: JSX.Element, namespace: string }, {}> {
    render() {
        return (
            <div id={`${this.props.namespace}${this.props.tabIndex}`} className={(this.props.active) ? "active" : ""}>
                {this.props.contents}
            </div>
        );
    }
}

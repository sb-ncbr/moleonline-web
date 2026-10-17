import React from "react";

export class DGRowEmpty extends React.Component<{ columnsCount: number }, {}> {

    render() {
        return (
            <tr>
                <td colSpan={this.props.columnsCount}>
                </td>
            </tr>);
    }
}

function getTitle(title: string[] | undefined, columnCount: number) {
    let tit: string[] = [];
    let sIdx = 0;
    if (title !== void 0) {
        tit = title;
        sIdx = title.length - 1;
    }
    for (; sIdx < columnCount; sIdx++) {
        tit.push("");
    }

    return tit;
}

export class DGElementRow extends React.Component<{ columns: JSX.Element[], columnsCount?: number, trClass?: string, tdClass?: string, title?: string[] }, {}> {

    private generateRow(columns: JSX.Element[]) {
        let tdClass = "";
        if (this.props.tdClass !== void 0) {
            tdClass = this.props.tdClass;
        }
        let columnsCount = columns.length;
        if (this.props.columnsCount !== void 0) {
            columnsCount = this.props.columnsCount;
        }
        let colSpan = 1 + (columnsCount - columns.length);
        let title = getTitle(this.props.title, columnsCount);

        let tds = [];
        for (let i = 0; i < columns.length; i++) {
            if (i === columns.length - 1 && columns.length !== columnsCount) {
                tds.push(
                    <td key={i} title={title[i]} className={`col col-${i + 1} ${tdClass}`} colSpan={colSpan}>
                        {columns[i]}
                    </td>
                );
                break;
            }

            tds.push(
                <td key={i} title={title[i]} className={`col col-${i + 1} ${tdClass}`}>
                    {columns[i]}
                </td>
            );
        }

        return tds;
    }

    render() {
        let trClass = "";
        if (this.props.trClass !== void 0) {
            trClass = this.props.trClass;
        }

        return (
            <tr className={trClass}>
                {this.generateRow(this.props.columns)}
            </tr>);
    }
}

export class DGNoDataInfoRow extends React.Component<{ columnsCount: number, infoText?: string }, {}> {
    render() {
        let infoText = "There are no data to be displayed...";
        if (this.props.infoText !== void 0) {
            infoText = this.props.infoText;
        }

        return (<tr><td colSpan={this.props.columnsCount} >{infoText}</td></tr>)
    }
}

// A header cell of a datagrid: its text is also its tooltip
export function headCell(title: string, column: number) {
    return <th key={column} title={title} className={`col col-${column}`}>{title}</th>;
}

// A datagrid of the detail tabs: a table with the header and one with the body; without a body, the noDataText
export function Datagrid(props: { id: string, head: React.ReactNode, columnsCount: number, noDataText: string, body: React.ReactNode | null }) {
    return (<div className="datagrid" id={props.id}>
        <div className="header">
            <table>
                <thead>
                    <tr>{props.head}</tr>
                </thead>
            </table>
        </div>
        <div className="body">
            {props.body ?? <table>
                <tbody>
                    <DGNoDataInfoRow columnsCount={props.columnsCount} infoText={props.noDataText} />
                    <DGRowEmpty columnsCount={props.columnsCount} />
                </tbody>
            </table>}
        </div>
    </div>);
}

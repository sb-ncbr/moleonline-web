import React from "react";

export class SimpleComboBox extends React.Component<{ id: string, items: { label: string, value: string }[], defaultSelectedIndex?: number, className?: string, onSelectedChange?: (e: any) => boolean }, {}> {
    render() {
        let classNames = "";
        if (this.props.className !== void 0) {
            classNames = this.props.className;
        }

        let selectedIdx = 0;
        if (this.props.defaultSelectedIndex !== void 0) {
            selectedIdx = this.props.defaultSelectedIndex;
        }

        let items = [];
        let idx = 0;
        const defaultValue = this.props.items?.[selectedIdx]?.value;
        for (let item of this.props.items) {
            items.push(
                <option key={idx} value={item.value}>{item.label}</option>
            );
            idx++;
        }

        return (
            <select id={this.props.id} defaultValue={defaultValue} style={{minWidth: "50px"}} className={classNames} onChange={this.props.onSelectedChange}>
                {items}
            </select>
        );
    }
}

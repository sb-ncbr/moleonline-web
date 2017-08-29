namespace Common.Controls{
    import React = LiteMol.Plugin.React;
    import ReactDOM = LiteMol.Plugin.ReactDOM;

    export class SimpleComboBox extends React.Component<{id:string, items:{label:string,value:string}[], defaultSelectedIndex?:number, className?:string, onSelectedChange?:(e:any)=>boolean},{}>{
        render(){
            let classNames = "";
            if(this.props.className!==void 0){
                classNames = this.props.className;
            }

            let selectedIdx = 0;
            if(this.props.defaultSelectedIndex!==void 0){
                selectedIdx = this.props.defaultSelectedIndex;
            }

            let items = [];
            let idx = 0;
            for(let item of this.props.items){
                items.push(
                    <option value={item.value} selected={(idx===selectedIdx)}>{item.label}</option>
                );
                idx++;
            }

            return (
                <select id={this.props.id} className={classNames} onChange={this.props.onSelectedChange}>
                    {items}
                </select>
            );
        }
    }

}
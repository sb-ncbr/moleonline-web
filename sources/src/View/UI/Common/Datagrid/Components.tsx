namespace Datagrid.Components{

    import React = LiteMol.Plugin.React

    export class DGRowEmpty extends React.Component<{columnsCount:number},{}>{
        
        render(){
            return (
                    <tr>
                        <td colSpan={this.props.columnsCount}>                            
                        </td>                     
                    </tr>);
        }
    }

    function getTitle(title:string[]|undefined, columnCount:number){
        let tit:string[] = [];
        let sIdx = 0;
        if(title !== void 0){
            tit = title;
            sIdx = title.length-1;
        }
        for(;sIdx<columnCount;sIdx++){
            tit.push("");
        }

        return tit;
    }

    export class DGRow extends React.Component<{columns: string[], columnsCount?:number, trClass?:string, tdClass?:string, forceHtml?:boolean, title?:string[]},{}>{
        
        private addTd(tds:JSX.Element[],i:number,columns:string[],columnsCount:number,forceHtml:boolean){
            let html = {__html:columns[i]};
            let tdClass = "";
            if(this.props.tdClass !== void 0){
                tdClass = this.props.tdClass;
            }
            let title = getTitle(this.props.title, columnsCount);

            if(forceHtml){
                tds.push(
                    <td title={title[i]} className={`col col-${i+1} ${tdClass}`} dangerouslySetInnerHTML={html}>
                    </td>    
                );  
            }
            else{
                tds.push(
                    <td title={title[i]} className={`col col-${i+1}`} >
                        {columns[i]}
                    </td>    
                );  
            }
        }

        private addTdWithColspan(tds:JSX.Element[],i:number,columns:string[],columnsCount:number,forceHtml:boolean){
            let html = {__html:columns[i]};
            let tdClass = "";
            if(this.props.tdClass !== void 0){
                tdClass = this.props.tdClass;
            }
            let title = getTitle(this.props.title,columnsCount);

            if(forceHtml){
                tds.push(
                    <td title={title[i]} className={`col col-${i+1} ${tdClass}`} colSpan={columnsCount-columns.length} dangerouslySetInnerHTML={html}>
                    </td>    
                );  
            }
            else{
                tds.push(
                    <td title={title[i]} className={`col col-${i+1} ${tdClass}`} colSpan={columnsCount-columns.length}>
                        {columns[i]}
                    </td>    
                );  
            }
        }

        private generateRow(columns: string[]){
            let columnsCount = columns.length;
            if(this.props.columnsCount !== void 0){
                columnsCount = this.props.columnsCount;
            }

            let forceHTML = false;
            if(this.props.forceHtml !== void 0){
                forceHTML = this.props.forceHtml;
            }

            let tds:JSX.Element[] = [];
            for(let i=0;i<columns.length;i++){
                if(i===columns.length-1 && columns.length !== columnsCount){
                    this.addTdWithColspan(tds,i,columns,columnsCount,forceHTML);
                    break;
                }
            
                this.addTd(tds,i,columns,columnsCount,forceHTML);
            }

            return tds;
        }

        render(){
            let trClass="";
            if(this.props.trClass !== void 0){
                trClass = this.props.trClass;
            }

            return (
                    <tr className={trClass}>
                        {this.generateRow(this.props.columns)}                     
                    </tr>);
        }
    }

    export class DGElementRow extends React.Component<{columns: JSX.Element[], columnsCount?:number, trClass?:string, tdClass?:string, title?:string[]},{}>{
        
        private generateRow(columns: JSX.Element[]){
            let tdClass = "";
            if(this.props.tdClass !== void 0){
                tdClass = this.props.tdClass;
            }
            let columnsCount = columns.length;
            if(this.props.columnsCount !== void 0){
                columnsCount = this.props.columnsCount;
            }
            let title = getTitle(this.props.title,columnsCount);

            let tds = [];
            for(let i=0;i<columns.length;i++){
                if(i===columns.length-1 && columns.length !== columnsCount){
                    tds.push(
                        <td title={title[i]} className={`col col-${i+1} ${tdClass}`} colSpan={columnsCount-columns.length}>
                            {columns[i]}
                        </td>    
                    );    
                    break;
                }
            
                tds.push(
                    <td title={title[i]} className={`col col-${i+1} ${tdClass}`}>
                        {columns[i]}
                    </td>    
                );
            }

            return tds;
        }

        render(){
            let trClass="";
            if(this.props.trClass !== void 0){
                trClass = this.props.trClass;
            }

            return (
                    <tr className={trClass}>
                        {this.generateRow(this.props.columns)}                     
                    </tr>);
        }
    }

    export class DGTdWithHtml extends React.Component<{contents:string, colIdx:number},{}>{
        render(){
            return (
                <td className={`col col-${this.props.colIdx}`} dangerouslySetInnerHTML={{__html: this.props.contents}}></td>
            );
        }
    }

    export class DGNoDataInfoRow extends React.Component<{columnsCount:number,infoText?:string},{}>{
        render(){
            let infoText = "There are no data to be displayed...";
            if(this.props.infoText !== void 0){
                infoText = this.props.infoText;
            }
            
            return (<tr><td colSpan={this.props.columnsCount} >{infoText}</td></tr>)
        }
    }
}
namespace LayersVizualizer.Component{
    export class Positionable{
        marginTop?: number;
        marginBottom?: number;
        marginLeft?: number;
        marginRight?:number;
        width?: number;
        height?: number;
        left?: number;
        right?: number;
        top?: number;
        bottom?: number;

        public toBounds(width:number,height:number){
            let xUnit = width/100;
            let yUnit = height/100;

            let x = 0;
            let y = 0;
            let w = 100;
            let h = 100;
            
            let ml = 0;
            let mr = 0;
            let mt = 0;
            let mb = 0;

            if(this.right === void 0 && this.left === void 0){
                this.left = 0;
            }
            if(this.bottom === void 0 && this.top === void 0){
                this.top = 0;
            }

            if(this.marginLeft !== void 0){
                ml = this.marginLeft;
            }
            if(this.marginRight !== void 0){
                mr = this.marginRight;
            }
            if(this.marginTop !== void 0){
                mt = this.marginTop;
            }
            if(this.marginBottom !== void 0){
                mb = this.marginBottom;
            }


            if(this.width !== void 0){
                w = this.width;

                if(this.left !== void 0){
                    x=this.left+ml;
                }else if(this.right !== void 0){
                    x=100-(this.right+mr+w);
                }
            }
            else{
                if(this.left !== void 0){
                    x=this.left+ml;
                    w-=x;
                }else if(this.right !== void 0){
                    x=0;
                    w-=this.right+mr;
                }
            }

            if(this.height !== void 0){
                h = this.height;

                if(this.top !== void 0){
                    y=this.top+mt;
                }
                else if(this.bottom !== void 0){
                    y=100-(this.bottom+mb+h);
                }
            }
            else{
                if(this.top !== void 0){
                    y=this.top+mt;
                    h-=y;
                }
                else if(this.bottom !== void 0){
                    y=0;
                    h-=this.bottom+mb
                }
            }

            return {
                x:x*xUnit,
                y:y*yUnit,
                width:w*xUnit,
                height:h*yUnit
            }
        }
    };

    export class Paintable extends Positionable{};
    export class Axis extends Positionable{};
}
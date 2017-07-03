namespace CommonUtils{
    export class Numbers{
        public static roundToDecimal(number:number,numOfDecimals:number){
            if(number.toString().indexOf(".")<=0 && number.toString().indexOf(",")<=0){
                return number;
            }
            let dec = Math.pow(10,numOfDecimals);
            return Math.round(number*dec)/dec;
        }
    }
}
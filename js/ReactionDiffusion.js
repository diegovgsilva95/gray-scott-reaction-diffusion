
import { roundNPlaces, constrain } from "./utils.js";


export class ReactionDiffusion {
    constructor(size = 256){
        this.DIFF = {A: 0.2097, B: 0.105};
        this.FEED = 0.029;
        this.KILL = 0.057;
        this.DELTA = 1.0;
        this.CELLCOUNT = size; 
        this.reset();
    }
    laplace(arr,idx){
        let lNb = arr[idx-1]||arr[arr.length-1];
        let rNb = arr[idx+1]||arr[0];
        let cur = arr[idx];

        return roundNPlaces((lNb + rNb) - (2 * cur),10);
    }
    newGen(){
        let cells = {A: [...this.cells.A], B: [...this.cells.B]}
        for(let idx = 0; idx < this.CELLCOUNT; idx++){//in this.cells.A){
            let lap = {
                A: this.DIFF.A * this.laplace(this.cells.A, idx),
                B: this.DIFF.B * this.laplace(this.cells.B, idx)
            };
            let A = cells.A[idx];
            let B = cells.B[idx];

            let ABsq = A*B*B;

            cells.A[idx] = constrain(A + this.DELTA * (lap.A - ABsq + this.FEED * (1 - A)), 0, 1);
            cells.B[idx] = constrain(B + this.DELTA * (lap.B + ABsq - B * (this.KILL + this.FEED)), 0, 1);
        }
         this.cells.A = cells.A;
         this.cells.B = cells.B;
    }
    reset(){
        this.cells = {
            A: new Array(this.CELLCOUNT).fill(1.000), 
            B: new Array(this.CELLCOUNT).fill(0.000)
        };
        this.cells.B[Math.floor(this.CELLCOUNT / 2)] = 1.0;
    }
    toString(){
        //0 to 9 and #
        let scale = ["0","1","2","3","4","5","6","7","8","9","#"];
        let res = "";
        for(let chemical in this.cells){
            res += `${chemical}: `;
            for(let val of this.cells[chemical]){
                val = Math.round(val * 10);
                res += scale[val];
            }
            res += `\r\n`;
        }        

        console.log(this.cells);
        return res;
    }
    getConfig(entries = ["FEED", "KILL"]){
        let r = {};
        let confs = Object.
            keys(this).
            filter(c=>{ 
                return entries && entries.length > 0 ? entries.includes(c) : true; 
            }).
            forEach(c=>{
                r[c] = this[c];
            });
        return r;
    }
    setConfig(confs){
        
        Object.
        keys(confs).
        forEach(c=>{
            if(!Object.keys(this).includes(c))
                return console.warn(`Unrecognized setting key ${c}. Skipping.`);
            // console.log(`this.${c} from ${this[c]} to ${confs[c]}`);
            this[c] = confs[c];
        });
    }


}


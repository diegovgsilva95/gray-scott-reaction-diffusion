/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (immutable) */ __webpack_exports__["b"] = init;
/* harmony export (immutable) */ __webpack_exports__["a"] = constrain;
/* harmony export (immutable) */ __webpack_exports__["c"] = roundNPlaces;

function init(){
    Number.prototype.times = function(fn){for(var i=0;i<this;i++) fn(i);}
}
function constrain(v,vmin,vmax){return v<vmin?vmin:(v>vmax?vmax:v);};
function roundNPlaces(v,places){let ten=Math.pow(10,places);return Math.round(v*ten)/ten;}

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ReactionDiffusion_js__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__audio_js__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__utils__ = __webpack_require__(0);





Object(__WEBPACK_IMPORTED_MODULE_2__utils__["b" /* init */])();
const SAMPLES = 256;

var templates = [
{FEED: 0.01953125, KILL: 0.04687500},
{FEED: 0.03125000, KILL: 0.05468750},
{FEED: 0.01953125, KILL: 0.046875}
];

var buffer = [];


var workerRD;

function init(){
    workerRD = new Worker("./WorkerRD.js");
    workerRD.onmessage = function(ev){
        console.log(ev);
    }    
    var cnv = document.getElementsByTagName("canvas")[0];
    var cnvw = cnv.width;
    var cnvh = cnv.height;

    var ctx = cnv.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.lineWidth = 0;
    ctx.fillRect(0,0,cnvw,cnvh);

    buffer = [];

    var rd = this.rd = new __WEBPACK_IMPORTED_MODULE_0__ReactionDiffusion_js__["a" /* ReactionDiffusion */](SAMPLES);
    var rdaud = this.rdaud = new __WEBPACK_IMPORTED_MODULE_1__audio_js__["a" /* RDAudio */](SAMPLES);
    
    rd.DIFF.A = 0.2097;//0.082;
    rd.DIFF.B = 0.105;//0.041;
    rd.FEED   = 0.029;//0.035;
    rd.KILL   = 0.057;//0.06;


    var doRender = function(){
        let cnvd = cnvw * 1.0 / rd.CELLCOUNT;
        
        for(let idx in rd.cells.A){     
            let valA = 255 * rd.cells.A[idx];
            let valB = 255 * rd.cells.B[idx];
            let col = { 
                r: 0,//Math.round(valA).toString(),
                g: Math.round(valA).toString(),
                b: 0//Math.round(valA).toString()
            };
            ctx.fillStyle = `rgb(${col.r}, ${col.g}, ${col.b})`;
            ctx.fillRect(idx * cnvd, 0, cnvd, cnvh / 2.0);
            col = { 
                r: Math.round(valB).toString(),
                g: Math.round(valB).toString(),
                b: Math.round(valB).toString()
            };
            ctx.fillStyle = `rgb(${col.r}, ${col.g}, ${col.b})`;
            ctx.fillRect(idx * cnvd, cnvh / 2.0, cnvd, cnvh / 2.0);
        }     
    };
    var doGen = function(){
        rd.newGen();
        Array.prototype.push.apply(buffer,rd.cells.A.map((c,i)=>[c,rd.cells.B[i]]));
    }
    var doGens = function(){
        (3).times(doGen);  
        doRender();        
    }
    doRender();
    setInterval(doGens,25);
    
    rdaud.recalculate = function(chans){
        // for(let channel of chans)
        //     for(let sampleIdx in channel){
        //         channel[sampleIdx] = ;
        //     }
        let v;
        for(let sampleIdx in chans[0]){
            if(buffer.length==0) 
                v=[0,0];
            else
                v = buffer.shift();
            chans[0][sampleIdx] = v[0];
            chans[1][sampleIdx] = v[1];
        }
    }
    cnv.addEventListener("mouseup", (ev)=>{
        ev.preventDefault();
        rd.FEED = ev.offsetX / cnvw;
        rd.KILL = ev.offsetY / cnvh;
        if(ev.button) rd.reset();
    });
    cnv.addEventListener("contextmenu", ev=>ev.preventDefault());
    cnv.addEventListener("mousemove", (ev)=>{

    })
}


window.addEventListener("load", init);




/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__utils_js__ = __webpack_require__(0);




class ReactionDiffusion {
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

        return Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["c" /* roundNPlaces */])((lNb + rNb) - (2 * cur),10);
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

            cells.A[idx] = Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* constrain */])(A + this.DELTA * (lap.A - ABsq + this.FEED * (1 - A)), 0, 1);
            cells.B[idx] = Object(__WEBPACK_IMPORTED_MODULE_0__utils_js__["a" /* constrain */])(B + this.DELTA * (lap.B + ABsq - B * (this.KILL + this.FEED)), 0, 1);
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
/* harmony export (immutable) */ __webpack_exports__["a"] = ReactionDiffusion;




/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";


class RDAudio {
    default_frameCount(sampleRate){
        return 0.5 * sampleRate; // half second 
    }
    validateFrameCount(frameCount){
        if(typeof frameCount === "function")
            frameCount = frameCount(this.sampleRate);
            
        if(typeof frameCount === "string")
            frameCount = parseFloat(frameCount);

        if(frameCount === null || frameCount === NaN || frameCount === false || frameCount === undefined){
            throw new Error(`frameCount cannot be ${frameCount}.`);
            return;
        }
        return frameCount;
    }
    default_recalculate(channels){
        for(let channel of channels)
            for(let sampleIdx in channel){
                channel[sampleIdx] = Math.random();
            }
    }
    processFrame(psev){
        
    }
    constructor(frameCount = default_frameCount){
        let self = this;
        this.audCtx = new AudioContext();
        this.sampleRate = this.audCtx.sampleRate;
        this.recalculate = this.default_recalculate;
        frameCount = this.validateFrameCount(frameCount);
        ///WARN: Actually, frameCount MUST be power of 2
        frameCount = Math.pow(2, Math.floor(Math.log2(frameCount)));
        this.bufSrc = this.audCtx.createBufferSource();
        this.audDsp = this.audCtx.createScriptProcessor(frameCount, 0,2);
        this.audDsp.onaudioprocess = function(ev){
            let outBuff = ev.outputBuffer;
            let chans = Array(outBuff.numberOfChannels).fill(outBuff).map((v,i)=>{ return v.getChannelData(i); });
            self.recalculate(chans);
        };
        this.bufSrc.connect(this.audDsp);
        this.audDsp.connect(this.audCtx.destination);
        this.bufSrc.start();
    }
}
/* harmony export (immutable) */ __webpack_exports__["a"] = RDAudio;



/***/ })
/******/ ]);
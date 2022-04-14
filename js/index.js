"use strict";

import { ReactionDiffusion } from "./ReactionDiffusion.js";
import { RDAudio } from "./audio.js";
import { init as UtilInit } from "./utils";
UtilInit();
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

    var rd = this.rd = new ReactionDiffusion(SAMPLES);
    var rdaud = this.rdaud = new RDAudio(SAMPLES);
    
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



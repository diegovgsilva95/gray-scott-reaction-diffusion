"use strict";

export class RDAudio {
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

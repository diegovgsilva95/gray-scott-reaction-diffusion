
export function init(){
    Number.prototype.times = function(fn){for(var i=0;i<this;i++) fn(i);}
}
export function constrain(v,vmin,vmax){return v<vmin?vmin:(v>vmax?vmax:v);};
export function roundNPlaces(v,places){let ten=Math.pow(10,places);return Math.round(v*ten)/ten;}
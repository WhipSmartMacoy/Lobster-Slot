const C = require('../core.js');
const N = +process.argv[2] || 2e6, lines = 40, bpl = 1, tb = lines*bpl;
let bet=0, base=0, scat=0, fs=0, buoy=0, fsTrig=0, buoyTrig=0, hits=0;
function buoyBonus(picks){ const v=C.shuffled(C.BUOY_VALUES); let s=0; for(let i=0;i<picks;i++) s+=v[i]; return s*tb; }
for (let i=0;i<N;i++){
  bet+=tb; const o=C.evaluate(C.spinGrid(),lines,bpl);
  base+=o.total-o.scatterWin; scat+=o.scatterWin; if(o.total>0)hits++;
  if(o.buoyBonus){buoyTrig++; buoy+=buoyBonus(o.buoyBonus);}
  if(o.freeSpins){fsTrig++; let left=C.FREE_SPINS;
    while(left>0){left--; const f=C.evaluate(C.spinGrid(),lines,bpl,C.FREE_SPIN_MULT); fs+=f.total;
      if(f.buoyBonus) fs+=buoyBonus(f.buoyBonus)*C.FREE_SPIN_MULT; if(f.freeSpins) left+=C.FREE_SPINS;}}
}
const p=x=>(100*x/bet).toFixed(2)+'%';
console.log({RTP:p(base+scat+fs+buoy),lines:p(base),scatter:p(scat),freeSpins:p(fs),buoy:p(buoy),hitRate:(hits/N).toFixed(3),fsEvery:Math.round(N/fsTrig),buoyEvery:Math.round(N/buoyTrig)});

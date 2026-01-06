const canvas=document.getElementById('field');
const ctx=canvas.getContext('2d');
const bg=new Image(); bg.src='map.jpg';

const cities=['涪州','桂州','永州','江州','光州','寿州'];
const colors={
  涪州:'#ff6b6b',桂州:'#ffd93d',永州:'#6bff95',
  江州:'#6ba8ff',光州:'#ff6bf0',寿州:'#6bfff5'
};

let nodes=[],currentType=null,currentCity=null;
let selected=null,drag=null;
let simRunning=false,simStart=0,simState={};

function setType(t){currentType=t}
function setCity(c){currentCity=c}

function addNode(x,y){
  if(!currentType||!currentCity) return;
  nodes.push({x,y,type:currentType,city:currentCity});
}

function deleteSelected(){
  if(!selected) return;
  nodes=nodes.filter(n=>n!==selected);
  selected=null;
}

function routePx(city){
  const path=nodes.filter(n=>n.city===city);
  let px=0;
  for(let i=0;i<path.length-1;i++){
    px+=Math.hypot(path[i+1].x-path[i].x,path[i+1].y-path[i].y);
  }
  return px;
}

function runSim(){
  simState={};
  simRunning=true;
  simStart=performance.now();
  const totalPx=cities.reduce((s,c)=>s+routePx(c),0)||1;

  cities.forEach(city=>{
    const px=routePx(city);
    const dist=px/totalPx*(+totalDist.value);
    simState[city]={
      time:0,
      lychee:+initLychee.value,
      speed:+baseSpeed.value,
      remainDist:dist
    };
  });
}

function resetSim(){
  simRunning=false;
  simState={};
}

function updateSim(){
  if(!simRunning) return;
  const now=performance.now();
  const dt=(now-simStart)/1000;
  simStart=now;

  cities.forEach(c=>{
    const s=simState[c];
    if(!s||s.remainDist<=0||s.lychee<=0) return;
    s.remainDist=Math.max(0,s.remainDist-s.speed*dt);
    s.time+=dt;
    s.lychee=Math.max(0,s.lychee-(+loss.value)*dt);
  });
}

function drawResult(){
  const r=document.getElementById('result');
  r.innerHTML='';
  const rank=cities.slice().sort((a,b)=>simState[a].remainDist-simState[b].remainDist);
  rank.forEach((c,i)=>{
    const s=simState[c];
    if(!s) return;
    const rate=s.lychee/(+initLychee.value);
    r.innerHTML+=`
      <div class="cell">${i+1}</div>
      <div class="cell" style="color:${colors[c]}">${c}</div>
      <div class="cell">
        ${Math.floor(s.lychee).toLocaleString()}
        <div class="bar"><span style="width:${rate*100}%;background:${colors[c]}"></span></div>
      </div>
      <div class="cell">${s.speed.toFixed(0)}</div>
      <div class="cell">${Math.ceil(s.remainDist).toLocaleString()}</div>
      <div class="cell">${s.time.toFixed(0)}</div>
    `;
  });
}

function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(bg.complete) ctx.drawImage(bg,0,0,canvas.width,canvas.height);

  nodes.forEach(n=>{
    ctx.fillStyle=colors[n.city];
    ctx.beginPath();ctx.arc(n.x,n.y,8,0,Math.PI*2);ctx.fill();
    if(n.type==='start'){
      ctx.fillStyle='#fff';
      ctx.font='12px system-ui';
      ctx.fillText(n.city,n.x+10,n.y-10);
    }
  });

  updateSim();
  if(simRunning) drawResult();
  requestAnimationFrame(draw);
}

canvas.onmousedown=e=>{
  if(simRunning) return;
  const r=canvas.getBoundingClientRect();
  const x=e.clientX-r.left,y=e.clientY-r.top;
  selected=null;
  for(const n of nodes){
    if(Math.hypot(n.x-x,n.y-y)<10){selected=n;drag=n;return;}
  }
  addNode(x,y);
};
canvas.onmousemove=e=>{
  if(drag&&!simRunning){
    const r=canvas.getBoundingClientRect();
    drag.x=e.clientX-r.left;drag.y=e.clientY-r.top;
  }
};
canvas.onmouseup=()=>drag=null;

draw();

/***** 初期設定 *****/
const canvas = document.getElementById('field');
const ctx = canvas.getContext('2d');
const bg = new Image();
bg.src = 'map.jpg';   // ← map.png / map.jpg は実ファイルに合わせる

const cities = ['涪州','桂州','永州','江州','光州','寿州'];
const colors = {
  涪州:'#ff6b6b',
  桂州:'#ffd93d',
  永州:'#6bff95',
  江州:'#6ba8ff',
  光州:'#ff6bf0',
  寿州:'#6bfff5'
};

/***** 状態 *****/
let nodes = [];
let currentType = null;              // start / goal / inn_small / inn_big
let selectedCities = [];             // 最大2都市
let simRunning = false;

/***** ノード種別選択 *****/
function setType(t){
  currentType = t;

  // ノード種別ボタンの active 表示
  document.querySelectorAll('.type-btn').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.type === t);
  });

  // スタート・ゴールは都市選択なし
  if(t === 'start' || t === 'goal'){
    selectedCities = [];
  }

  refreshCityButtons();
}

/***** 都市選択（最大2都市）*****/
function toggleCity(city){
  // スタート・ゴール中は都市選択不可
  if(currentType === 'start' || currentType === 'goal') return;

  if(selectedCities.includes(city)){
    selectedCities = selectedCities.filter(c=>c!==city);
  }else if(selectedCities.length < 2){
    selectedCities.push(city);
  }

  refreshCityButtons();
}

function refreshCityButtons(){
  document.querySelectorAll('.city-btn').forEach(btn=>{
    const c = btn.textContent;
    if(selectedCities.includes(c)){
      btn.classList.add('active');
      btn.style.background = colors[c];
      btn.style.color = '#000';
    }else{
      btn.classList.remove('active');
      btn.style.background = '';
      btn.style.color = '';
    }
  });
}

/***** ノード追加 *****/
function addNode(x, y){
  if(!currentType) return;

  // 共用スタート・ゴールは1つだけ
  if(currentType === 'start' || currentType === 'goal'){
    nodes = nodes.filter(n => n.type !== currentType);
    nodes.push({
      x, y,
      type: currentType,
      cities: []
    });
    return;
  }

  // 小宿・大宿（1～2都市）
  if(selectedCities.length === 0) return;

  nodes.push({
    x, y,
    type: currentType,
    cities: [...selectedCities]
  });
}

/***** 描画 *****/
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(bg.complete){
    ctx.drawImage(bg,0,0,canvas.width,canvas.height);
  }

  nodes.forEach(n=>{
    // スタート・ゴール（共用）
    if(n.type === 'start' || n.type === 'goal'){
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(n.x,n.y,10,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(n.type.toUpperCase(), n.x+12, n.y-12);
      return;
    }

    // 専用ルート
    if(n.cities.length === 1){
      ctx.fillStyle = colors[n.cities[0]];
      ctx.beginPath();
      ctx.arc(n.x,n.y,8,0,Math.PI*2);
      ctx.fill();
      return;
    }

    // 共同利用ルート（2都市）
    ctx.lineWidth = 4;
    ctx.strokeStyle = colors[n.cities[0]];
    ctx.beginPath();
    ctx.arc(n.x,n.y,10,0,Math.PI);
    ctx.stroke();

    ctx.strokeStyle = colors[n.cities[1]];
    ctx.beginPath();
    ctx.arc(n.x,n.y,10,Math.PI,Math.PI*2);
    ctx.stroke();
  });

  requestAnimationFrame(draw);
}

/***** Canvas操作 *****/
canvas.onmousedown = e=>{
  if(simRunning) return;
  const r = canvas.getBoundingClientRect();
  addNode(
    e.clientX - r.left,
    e.clientY - r.top
  );
};

/***** 起動 *****/
draw();

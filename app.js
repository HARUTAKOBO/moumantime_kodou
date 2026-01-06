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

/* ===== 追加：選択中ノード ===== */
let selectedNodeIndex = null;

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

/* HTML互換用（既存HTML対応） */
function setCity(city){
  toggleCity(city);
}

function refreshCityButtons(){
  document.querySelectorAll('.city-btn').forEach(btn=>{
    const c = btn.textContent;
    if(selectedCities.includes(c)){
      btn.classList.add('active');
    }else{
      btn.classList.remove('active');
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

/***** ノード選択 *****/
function selectNode(x, y){
  selectedNodeIndex = null;

  // 上に描画されたノードを優先
  for(let i = nodes.length - 1; i >= 0; i--){
    const n = nodes[i];
    const r = (n.type === 'start' || n.type === 'goal') ? 10 : 8;
    if(Math.hypot(n.x - x, n.y - y) <= r + 4){
      selectedNodeIndex = i;
      break;
    }
  }
}

/***** 描画 *****/
function draw(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(bg.complete){
    ctx.drawImage(bg,0,0,canvas.width,canvas.height);
  }

  nodes.forEach((n,i)=>{
    // スタート・ゴール（共用）
    if(n.type === 'start' || n.type === 'goal'){
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(n.x,n.y,10,0,Math.PI*2);
      ctx.fill();

      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText(n.type.toUpperCase(), n.x+12, n.y-12);
    }
    // 専用ルート
    else if(n.cities.length === 1){
      ctx.fillStyle = colors[n.cities[0]];
      ctx.beginPath();
      ctx.arc(n.x,n.y,8,0,Math.PI*2);
      ctx.fill();
    }
    // 共同利用ルート（2都市）
    else{
      ctx.lineWidth = 4;
      ctx.strokeStyle = colors[n.cities[0]];
      ctx.beginPath();
      ctx.arc(n.x,n.y,10,0,Math.PI);
      ctx.stroke();

      ctx.strokeStyle = colors[n.cities[1]];
      ctx.beginPath();
      ctx.arc(n.x,n.y,10,Math.PI,Math.PI*2);
      ctx.stroke();
    }

    /* 選択中ノードの強調表示 */
    if(i === selectedNodeIndex){
      ctx.strokeStyle = '#ffd86b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
  });

  requestAnimationFrame(draw);
}

/***** Canvas操作 *****/
canvas.onmousedown = e=>{
  if(simRunning) return;
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  // Shift + クリック → 選択
  if(e.shiftKey){
    selectNode(x, y);
    return;
  }

  // 通常クリック → 追加
  addNode(x, y);
};

/***** 削除 *****/
function deleteSelected(){
  if(selectedNodeIndex === null) return;
  nodes.splice(selectedNodeIndex, 1);
  selectedNodeIndex = null;
}

/***** ダミー（既存HTML対応）*****/
function runSim(){}
function resetSim(){
  nodes = [];
  selectedNodeIndex = null;
}

/***** 起動 *****/
draw();

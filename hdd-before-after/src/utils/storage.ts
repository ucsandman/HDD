import type { SliderComparison } from '../types';

const STORAGE_KEY = 'hdd-before-after-comparisons';

// Only log errors in development mode
const logError = (message: string, error: unknown) => {
  if (import.meta.env.DEV) {
    console.error(message, error);
  }
};

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function loadComparisons(): SliderComparison[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    logError('Failed to load comparisons:', error);
    return [];
  }
}

export function saveComparisons(comparisons: SliderComparison[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisons));
  } catch (error) {
    logError('Failed to save comparisons:', error);
  }
}

/**
 * Generate HTML embed code for a comparison slider
 * Creates a self-contained HTML snippet with inline styles and JS
 */
export function generateEmbedCode(comparison: SliderComparison): string {
  const containerId = `hdd-slider-${comparison.id}`;
  const isHorizontal = comparison.orientation === 'horizontal';

  return `<!-- HDD Before/After Slider - ${comparison.name} -->
<div id="${containerId}" class="hdd-slider-container" style="position:relative;width:100%;max-width:800px;margin:0 auto;overflow:hidden;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);aspect-ratio:4/3;">
  <div style="position:absolute;inset:0;">
    <img src="${comparison.afterImage.url}" alt="${comparison.afterImage.caption}" style="width:100%;height:100%;object-fit:cover;" />
  </div>
  <div class="hdd-slider-before" style="position:absolute;inset:0;width:50%;overflow:hidden;${isHorizontal ? '' : 'width:100%;height:50%;'}">
    <img src="${comparison.beforeImage.url}" alt="${comparison.beforeImage.caption}" style="width:${isHorizontal ? '200%' : '100%'};height:${isHorizontal ? '100%' : '200%'};object-fit:cover;" />
  </div>
  <div class="hdd-slider-handle" style="position:absolute;${isHorizontal ? 'top:0;bottom:0;left:50%;width:4px;' : 'left:0;right:0;top:50%;height:4px;'}background:#2F5233;cursor:${isHorizontal ? 'ew-resize' : 'ns-resize'};z-index:10;">
    <div style="position:absolute;${isHorizontal ? 'top:50%;left:50%;transform:translate(-50%,-50%);' : 'top:50%;left:50%;transform:translate(-50%,-50%);'}width:40px;height:40px;background:#2F5233;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      <span style="color:white;font-size:14px;">${isHorizontal ? '\\u2194' : '\\u2195'}</span>
    </div>
  </div>
  <div style="position:absolute;${isHorizontal ? 'left:12px;' : 'left:12px;'}top:12px;background:rgba(47,82,51,0.9);color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;">BEFORE</div>
  <div style="position:absolute;${isHorizontal ? 'right:12px;' : 'right:12px;'}${isHorizontal ? 'top:12px;' : 'bottom:12px;'}background:rgba(47,82,51,0.9);color:white;padding:4px 12px;border-radius:4px;font-size:12px;font-weight:600;">AFTER</div>
</div>
<script>
(function(){
  var container=document.getElementById('${containerId}');
  var before=container.querySelector('.hdd-slider-before');
  var handle=container.querySelector('.hdd-slider-handle');
  var isDragging=false;
  var isHorizontal=${isHorizontal};
  function updatePosition(pos){
    if(isHorizontal){
      var pct=Math.max(0,Math.min(100,pos));
      before.style.width=pct+'%';
      handle.style.left=pct+'%';
    }else{
      var pct=Math.max(0,Math.min(100,pos));
      before.style.height=pct+'%';
      handle.style.top=pct+'%';
    }
  }
  function getPosition(e){
    var rect=container.getBoundingClientRect();
    var clientX=e.touches?e.touches[0].clientX:e.clientX;
    var clientY=e.touches?e.touches[0].clientY:e.clientY;
    if(isHorizontal){
      return((clientX-rect.left)/rect.width)*100;
    }else{
      return((clientY-rect.top)/rect.height)*100;
    }
  }
  handle.addEventListener('mousedown',function(e){isDragging=true;e.preventDefault();});
  handle.addEventListener('touchstart',function(e){isDragging=true;e.preventDefault();},{passive:false});
  document.addEventListener('mousemove',function(e){if(isDragging)updatePosition(getPosition(e));});
  document.addEventListener('touchmove',function(e){if(isDragging)updatePosition(getPosition(e));},{passive:true});
  document.addEventListener('mouseup',function(){isDragging=false;});
  document.addEventListener('touchend',function(){isDragging=false;});
  container.addEventListener('click',function(e){if(e.target!==handle)updatePosition(getPosition(e));});
})();
</script>
<!-- End HDD Before/After Slider -->`;
}

/**
 * Download embed code as HTML file
 */
export function downloadEmbedCode(comparison: SliderComparison): void {
  const embedCode = generateEmbedCode(comparison);
  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${comparison.name} - Before/After</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: #f5f5f5;
    }
    h1 {
      text-align: center;
      color: #2F5233;
      margin-bottom: 20px;
    }
    p {
      text-align: center;
      color: #666;
      max-width: 800px;
      margin: 0 auto 20px;
    }
  </style>
</head>
<body>
  <h1>${comparison.projectName}</h1>
  <p>Drag the slider to compare before and after images.</p>
  ${embedCode}
  <p style="margin-top:20px;font-size:12px;">Created by Hickory Dickory Decks Cincinnati</p>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${comparison.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-slider.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

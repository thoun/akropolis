const WIDTH = document.getElementById('canvas-container').offsetWidth;
const HEIGHT = document.getElementById('canvas-container').offsetHeight;
const ANGLE = (2 * Math.PI) / 6;
const SCALE = 1 / 2;
const SIZE = SCALE * 462;
const CLIP_PATH_MARGIN = 5 / 100;

let DRAW_GRID = document.getElementById('checkbox-grid').checked;
let CROP = document.getElementById('checkbox-crop').checked;

const OFFSET_X = SIZE / 2;
///////////////////////////////////////////////////////////////////
//  ___                                   ____        _
// |_ _|_ __ ___   __ _  __ _  ___  ___  |  _ \  __ _| |_ __ _
//  | || '_ ` _ \ / _` |/ _` |/ _ \/ __| | | | |/ _` | __/ _` |
//  | || | | | | | (_| | (_| |  __/\__ \ | |_| | (_| | || (_| |
// |___|_| |_| |_|\__,_|\__, |\___||___/ |____/ \__,_|\__\__,_|
//                      |___/
///////////////////////////////////////////////////////////////////

// V1 : just putting them side by side
// prettier-ignore
// let imagesConfiguration = JSON.parse(localStorage.getItem('imagesConfigurationAkropolis')) ?? {"barrack-district":{"x":2,"y":1},"barrack-plaza":{"x":2,"y":1},"garden-district":{"x":2,"y":1},"garden-plaza":{"x":2,"y":1},"house-district":{"x":2,"y":1},"house-plaza":{"x":2,"y":1},"market-district":{"x":2,"y":1},"market-plaza":{"x":2,"y":1},"temple-district":{"x":2,"y":1},"temple-plaza":{"x":2,"y":1},"quarry":{"x":2,"y":1}};;
// V2 : with expansion
let imagesConfiguration = JSON.parse(localStorage.getItem('imagesConfigurationAkropolis')) ?? {"barrack-district":{"x":"606","y":"373"},"barrack-plaza":{"x":"-29","y":"-62"},"garden-district":{"x":"-72","y":"742"},"garden-plaza":{"x":"670","y":"1154"},"house-district":{"x":"1359","y":"-50"},"house-plaza":{"x":"1975","y":"366"},"market-district":{"x":"1286","y":"778"},"market-plaza":{"x":"1968","y":"1167"},"temple-district":{"x":"-85","y":"1554"},"temple-plaza":{"x":"634","y":"1957"},"quarry":{"x":"1325","y":"1508"},"garden-market":{"x":"7","y":0},"garden-market-district":{"x":"-46","y":"2308"},"barrack-garden-district":{"x":"2052","y":"1963"},"barrack-temple-district":{"x":"2724","y":"2366"},"house-barrack-district":{"x":"2732","y":"1555"},"house-garden-district":{"x":"2736","y":"760"},"house-market-district":{"x":"2742","y":"-46"},"house-temple-district":{"x":"-40","y":"2356"},"market-barrack-district":{"x":"656","y":"2759"},"market-garden-district":{"x":"2039","y":"2764"},"market-temple-district":{"x":"1352","y":"2360"},"back":{"x":"1359","y":"3160"},"temple-garden-district":{"x":"-61","y":"3173"}}

let images = [

  'barrack-district',
  'barrack-plaza',
	'garden-district',
	'garden-plaza',
	'house-district',
	'house-plaza',
	'market-district',
	'market-plaza',
	'temple-district',
	'temple-plaza',
	'quarry',


	'barrack-garden-district',
	'barrack-temple-district',
	'house-barrack-district',
	'house-garden-district',
	'house-market-district',
	'house-temple-district',
	'market-barrack-district',
	'market-garden-district',
	'market-temple-district',
	'temple-garden-district',
	'back',
];

// For each image, starting at the corner, give the list of hex that should be kept
let imagesHex = {
  'barrack-district': ['1_1'],
  'barrack-plaza' : ['1_1'],
  'garden-district': ['1_1'],
  'garden-plaza' : ['1_1'],
  'house-district': ['1_1'],
  'house-plaza' : ['1_1'],
  'market-district': ['1_1'],
  'market-plaza' : ['1_1'],
  'temple-district': ['1_1'],
  'temple-plaza' : ['1_1'],
  'quarry' : ['1_1'],

	'barrack-garden-district': ['1_1'],
	'barrack-temple-district': ['1_1'],
	'house-barrack-district': ['1_1'],
	'house-garden-district': ['1_1'],
	'house-market-district': ['1_1'],
	'house-temple-district': ['1_1'],
	'market-barrack-district': ['1_1'],
	'market-garden-district': ['1_1'],
	'market-temple-district': ['1_1'],
	'temple-garden-district': ['1_1'],
	'back': ['1_1'],
};

////////////////////////
//  ___       _ _
// |_ _|_ __ (_) |_
//  | || '_ \| | __|
//  | || | | | | |_
// |___|_| |_|_|\__|
////////////////////////

// Create the canvas and control for each image
images.forEach((img) => {
  if (imagesConfiguration[img] == undefined) {
    imagesConfiguration[img] = {
      x: 0,
      y: 0,
    };
  }

  let c = imagesConfiguration[img];
  document.getElementById('controls').insertAdjacentHTML(
    'beforeend',
    `<div class='control'>
      <label>${img}</label>
      <input type='number' id='control-${img}-x' value='${c.x}' />
      <input type='number' id='control-${img}-y' value='${c.y}' />
      <span class='center-coordinates' id='coordinates-${img}'></span>
    </div>`
  );

  document.getElementById(`control-${img}-x`).addEventListener('change', function () {
    c.x = this.value;
    let a = JSON.stringify(imagesConfiguration);
    document.getElementById('configuration').innerHTML = a;
    localStorage.setItem('imagesConfigurationAkropolis', a);
    drawImage(img);
  });
  document.getElementById(`control-${img}-y`).addEventListener('change', function () {
    c.y = this.value;
    let a = JSON.stringify(imagesConfiguration);
    document.getElementById('configuration').innerHTML = a;
    localStorage.setItem('imagesConfigurationAkropolis', a);
    drawImage(img);
  });

  document
    .getElementById('canvas-container')
    .insertAdjacentHTML('beforeend', `<canvas id="canvas-${img}" width="${WIDTH}" height="${HEIGHT}"></canvas>`);
});
document
  .getElementById('controls')
  .insertAdjacentHTML('beforeend', `<textarea id='configuration'>${JSON.stringify(imagesConfiguration)}</textarea>`);

document
  .getElementById('canvas-container')
  .insertAdjacentHTML('beforeend', `<canvas id="canvas-grid" width="${WIDTH}" height="${HEIGHT}"></canvas>`);

document.getElementById('checkbox-crop').addEventListener('change', function () {
  CROP = this.checked;
  drawImages();
});

document.getElementById('checkbox-grid').addEventListener('change', function () {
  DRAW_GRID = this.checked;
  drawGrid();
});

document.getElementById('generate').addEventListener('click', () => {
  document.getElementById('editor').style.marginLeft = '-100%';
  generateSprite();
});

document.getElementById('close-result').addEventListener('click', () => {
  document.getElementById('editor').style.marginLeft = '0%';
});
document.getElementById('regenerate').addEventListener('click', () => {
  generateSprite();
});

//////////////////////////////////
//  ____
// |  _ \ _ __ __ ___      __
// | | | | '__/ _` \ \ /\ / /
// | |_| | | | (_| |\ V  V /
// |____/|_|  \__,_| \_/\_/
//////////////////////////////////
function drawImages() {
  images.forEach((img, i) => {
    drawImage(img);
  });

  drawGrid();
}

let imagesCorners = {};
function drawImage(img) {
  let canvas = document.getElementById(`canvas-${img}`);
  let ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let c = imagesConfiguration[img];
  let data = imagesDatas[img];
  let cornerX = parseInt(SCALE * parseInt(c.x));
  let cornerY = parseInt(SCALE * parseInt(c.y));
  let width = parseInt(SCALE * data.width);
  let height = parseInt(SCALE * data.height);
  ctx.drawImage(data, cornerX, cornerY, width, height);

  let axial_c = pixel_to_flat_hex_axial(cornerX, cornerY);
  let hex = axial_to_doubleheight(axial_c);
  imagesCorners[img] = hex;
  document.getElementById(`coordinates-${img}`).innerHTML = `(${hex.col}, ${hex.row})`;

  if (CROP && imagesHex[img]) {
    var imageData = ctx.getImageData(cornerX, cornerY, width, height);
    var pixel = imageData.data;
    for (let x = 0; x <= width; x++) {
      for (let y = 0; y <= height; y++) {
        let axial_coords = pixel_to_flat_hex_axial(cornerX + x, cornerY + y);
        let coords = axial_to_doubleheight(axial_coords);

        let udelta = `${coords.col - hex.col}_${coords.row - hex.row}`;
        if (!imagesHex[img].includes(udelta)) {
          let p = 4 * (x + y * width);
          pixel[p + 3] = 0;
        }
      }
    }
    ctx.putImageData(imageData, cornerX, cornerY);
  }
}

/////////////////////////////////////////////////
//  _   _              ____      _     _
// | | | | _____  __  / ___|_ __(_) __| |
// | |_| |/ _ \ \/ / | |  _| '__| |/ _` |
// |  _  |  __/>  <  | |_| | |  | | (_| |
// |_| |_|\___/_/\_\  \____|_|  |_|\__,_|
/////////////////////////////////////////////////

function drawGrid(canvas = null, clear = true) {
  canvas = canvas || document.getElementById(`canvas-grid`);
  let ctx = canvas.getContext('2d');
  if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.lineWidth = 2;

  if (DRAW_GRID) {
    ctx.strokeStyle = 'black';
    ctx.fillStyle = 'transparent';

    let maxX = canvas.width / ((Math.sqrt(3) * SIZE) / 2);
    let maxY = canvas.height / (2 * SIZE) + 2;
    for (let x = 0; x <= maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        drawHexagon(ctx, x, y);
      }
    }

    if (highlightedHex !== null) {
      ctx.strokeStyle = 'red';
      ctx.fillStyle = 'rgba(255,0,0,0.3)';
      drawHexagon(ctx, highlightedHex.col, highlightedHex.row);
    }
  }
}

// Draw one hexagon, using qoffset coordinates
let highlightedHex = null;
function drawHexagon(ctx, a, b) {
  let center = oddq_offset_to_pixel(a, b);
  ctx.beginPath();
  for (var i = 0; i < 6; i++) {
    ctx.lineTo(center.x + SIZE * Math.cos(ANGLE * i) - OFFSET_X, center.y + SIZE * Math.sin(ANGLE * i));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
}

// Coordinates helper
document.getElementById('canvas-grid').addEventListener('mousemove', function (evt) {
  let canvas = document.getElementById(`canvas-wrapper`);
  let x = evt.x - canvas.offsetLeft;
  let y = evt.y - canvas.offsetTop;
  let axial_c = pixel_to_flat_hex_axial(x, y);
  let c = axial_to_oddq(axial_c);
  let d = axial_to_doubleheight(axial_c);

  document.getElementById('coordinates').innerHTML = `(${d.col}, ${d.row})`;
  highlightedHex = c;
  drawGrid();
});
document.getElementById('canvas-grid').addEventListener('mouseout', function (evt) {
  highlightedHex = null;
  drawGrid();
});

// Convert pixel position to hex grid coordinate
function pixel_to_flat_hex_axial(x, y) {
  x += OFFSET_X;
  var q = ((2 / 3) * x) / SIZE;
  var r = ((-1 / 3) * x + (Math.sqrt(3) / 3) * y) / SIZE;
  let t = axial_round(q, r);
  return { q: t[0], r: t[1] };
}

function axial_round(x, y) {
  const xgrid = Math.round(x),
    ygrid = Math.round(y);
  (x -= xgrid), (y -= ygrid); // remainder
  const dx = Math.round(x + 0.5 * y) * (x * x >= y * y);
  const dy = Math.round(y + 0.5 * x) * (x * x < y * y);
  return [xgrid + dx, ygrid + dy];
}

function axial_to_oddq(hex) {
  var col = hex.q;
  var row = hex.r + (hex.q - (hex.q % 2)) / 2;
  return { col, row };
}

function axial_to_doubleheight(hex) {
  var col = hex.q;
  var row = 2 * hex.r + hex.q;
  return { col, row };
}

// Convert a hex grid coordinate to the pixel position of the center of the hex
function oddq_offset_to_pixel(col, row) {
  var x = ((SIZE * 3) / 2) * col;
  var y = SIZE * Math.sqrt(3) * (row + 0.5 * (col % 2));
  return { x, y };
}

const BORDER_DIRECTIONS = [
  [-1, -1],
  [1, -1],
  [2, 0],
  [1, 1],
  [-1, 1],
  [-2, 0],
];

////////////////////////////////
//  ____             _ _
// / ___| _ __  _ __(_) |_ ___
// \___ \| '_ \| '__| | __/ _ \
//  ___) | |_) | |  | | ||  __/
// |____/| .__/|_|  |_|\__\___|
//       |_|
////////////////////////////////
function getDimensions(dx, dy) {
  let width = parseInt((0.5 + dx * 1.5) * SIZE),
    height = parseInt((((dy + 1) * Math.sqrt(3)) / 2) * SIZE);
  return { width, height };
}

function generateSprite() {
  // Remove existing canvas
  let canvas = document.getElementById('canvas-result');
  if (canvas) {
    canvas.remove();
  }

  // Compute max width and max height
  let gMaxX = 0,
    gMaxY = 0;
  images.forEach((img) => {
    let corner = imagesCorners[img];
    imagesHex[img].forEach((delta) => {
      let t = delta.split('_');
      let dx = parseInt(t[0]),
        dy = parseInt(t[1]);
      let x = corner.col + dx,
        y = corner.row + dy;
      gMaxX = Math.max(gMaxX, x);
      gMaxY = Math.max(gMaxY, y);
    });
  });

  // Compute corresponding width and height and create canvas
  let dims = getDimensions(gMaxX, gMaxY);
  document
    .getElementById('canvas-result-container')
    .insertAdjacentHTML(
      'afterbegin',
      `<canvas id="canvas-result" width="${dims.width}" height="${dims.height}"></canvas>`
    );
  console.log(gMaxX, gMaxY, dims.width, dims.height);

  // Draw on the canvas
  canvas = document.getElementById('canvas-result');
  let ctx = canvas.getContext('2d');
  images.forEach((img) => {
    let imgCanvas = document.getElementById(`canvas-${img}`);
    ctx.drawImage(imgCanvas, 0, 0);
  });
  //  drawGrid(canvas, false);

  // Generate css
  let result = document.getElementById('scss-result');
  let textarea = document.getElementById('css-result');
  result.innerHTML = `
.building-container {
  .building-inner {
    background:url('img/enclosures.jpg');
    background-repeat:no-repeat;
  }
  
`;
  textarea.innerHTML = '';
  textarea.innerHTML += `
.building-container {
  margin:5px;
  position:relative;
}
.building-container .building-border,
.building-container .building-inner {
  position:absolute;
  top:0;
  left:0;
}

.building-container:hover .building-border {
  background:red;
}
.building-container[data-rotation='1'] {
  transform:rotate(60deg);
}
.building-container[data-rotation='2'] {
  transform:rotate(120deg);
}
.building-container[data-rotation='3'] {
  transform:rotate(180deg);
}
.building-container[data-rotation='4'] {
  transform:rotate(240deg);
}
.building-container[data-rotation='5'] {
  transform:rotate(300deg);
}

.building-crosshairs {
  width:30px;
  height:30px;
  position:absolute;
  background:url('crosshairs.svg');
  margin-left:-15px;
  margin-top:-15px;
}

.building-inner {
  background:-moz-element(#canvas-result);
  background-repeat:no-repeat;
}
`;
  // WEBKIT :   background:-webkit-canvas(canvas-result);

  let offsets = {};
  images.forEach((img) => {
    // Compute min/max of X/Y to know the size of the tile
    let minX = 100000,
      minY = 100000,
      maxX = 0,
      maxY = 0;
    let corner = imagesCorners[img];
    let points = [];
    imagesHex[img].forEach((delta, i) => {
      let t = delta.split('_');
      let dx = parseInt(t[0]),
        dy = parseInt(t[1]);
      let x = corner.col + dx,
        y = corner.row + dy;
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);

      // Compute the 6 points around the border
      BORDER_DIRECTIONS.forEach((dir) => {
        let localX = 3 * x + dir[0],
          localY = y + dir[1];
        const point = points.find((o) => o.x == localX && o.y == localY);
        if (point) {
          point.hexes.push(i);
          point.dirs.push(dir);
        } else {
          points.push({
            x: localX,
            y: localY,
            hexes: [i],
            dirs: [dir],
          });
        }
      });
    });

    // Compute boundary
    points = points.filter((p) => p.hexes.length < 3);
    let cPoint = points.shift();
    let firstPoint = cPoint;
    let boundary = [cPoint];
    while (points.length > 0) {
      let index = points.findIndex(
        (p) =>
          ((Math.abs(p.x - cPoint.x) == 2 && p.y == cPoint.y) ||
            (Math.abs(p.x - cPoint.x) == 1 && Math.abs(p.y - cPoint.y) == 1)) &&
          intersect(p.hexes, cPoint.hexes).length == 1
      );
      if (index == -1) {
        console.log("Shouldn't happen");
        console.log(cPoint, points);
        return false;
      }

      boundary.push(points[index]);
      cPoint = points[index];
      points.splice(index, 1);
    }
    boundary.push(firstPoint);
    let computeClipPath = (boundary, margin) => {
      return boundary.map((point) => {
        let x = point.x;
        let y = point.y;
        if (margin > 0) {
          let sumDir = point.dirs.reduce((carry, d) => [carry[0] - d[0], carry[1] - d[1]], [0, 0]);
          x += sumDir[0] * margin;
          y += sumDir[1] * margin;
        }
        let percentX = (x - 3 * minX + 2) / (1 + 3 * (maxX - minX + 1));
        let percentY = (y - minY + 1) / (maxY - minY + 2);
        return `${percentX * 100}% ${percentY * 100}%`;
      });
    };
    let clipPath = computeClipPath(boundary, 0);
    let innerClipPath = computeClipPath(boundary, CLIP_PATH_MARGIN);

    let innerClipPath2 = computeClipPath(boundary, 2.5 * CLIP_PATH_MARGIN);
    let borderClipPath = [...clipPath, clipPath[0], innerClipPath2[0], ...innerClipPath2.reverse()];

    let imgDims = getDimensions(maxX - minX + 1, maxY - minY + 1);
    // Compute % for background positions
    let deltaX = minX - 1;
    let outX = gMaxX - (maxX - minX + 1);
    let deltaY = minY - 1;
    let outY = gMaxY - (maxY - minY + 1);

    // Compute % for rotation
    let refHex = imagesHex[img][0].split('_');
    let refX = 3 * (parseInt(refHex[0]) + corner.col),
      refY = parseInt(refHex[1]) + corner.row;
    let offsetX = refX - 3 * minX + 2,
      offsetY = refY - minY + 1;
    offsets[img] = {
      x: offsetX,
      y: offsetY,
    };
    let refPercentX = offsetX / (1 + 3 * (maxX - minX + 1));
    let refPercentY = offsetY / (maxY - minY + 2);

    textarea.innerHTML += `
.building-container[data-type="${img}"] {
  width:${imgDims.width}px;
  height:${imgDims.height}px;
  clip-path:polygon(${clipPath.join(', ')});
  transform-origin: ${refPercentX * 100}% ${refPercentY * 100}%;
}
.building-container[data-type="${img}"] .building-border {
  width:${imgDims.width}px;
  height:${imgDims.height}px;
  clip-path:polygon(${borderClipPath.join(', ')});
}
.building-container[data-type="${img}"] .building-inner {
  width:${imgDims.width}px;
  height:${imgDims.height}px;
  background-position: ${(outX == 0 ? 0 : deltaX / outX) * 100}% ${(outY == 0 ? 0 : deltaY / outY) * 100}%;
  clip-path:polygon(${innerClipPath.join(', ')});
  background:none;
}
.building-container[data-type="${img}"] .building-crosshairs {
  left: ${refPercentX * 100}%;
  top: ${refPercentY * 100}%;
}
`;

    result.innerHTML += `
  &[data-type='${img}'] {
    width:${imgDims.width}px;
    height:${imgDims.height}px;
    margin-left:${-(offsetX - 2) * 100}%;
    margin-top:${-(offsetY - 1) * Math.sqrt(3) * 100}%;
    clip-path:polygon(${clipPath.join(', ')});
    transform-origin: ${refPercentX * 100}% ${refPercentY * 100}%;

    .building-inner {
      background-position: ${(outX == 0 ? 0 : deltaX / outX) * 100}% ${(outY == 0 ? 0 : deltaY / outY) * 100}%;
      clip-path:polygon(${innerClipPath.join(', ')});
    }
    .building-border {
      clip-path:polygon(${borderClipPath.join(', ')});
    }
    .building-crosshairs {
      left: ${refPercentX * 100}%;
      top: ${refPercentY * 100}%;
    }
  }
`;
  });
  result.innerHTML += '}';

  /* create the style element */
  const styleElement = document.createElement('style');
  styleElement.appendChild(document.createTextNode(textarea.innerHTML));
  document.getElementsByTagName('head')[0].appendChild(styleElement);

  // Generate demo elements
  let demo = document.getElementById('result-demo');
  demo.innerHTML = '';
  images.forEach((img) => {
    demo.insertAdjacentHTML(
      'beforeend',
      `<div id="building-${img}" data-type="${img}" class='building-${img} building-container'>
        <div class='building-border'></div>
        <div class='building-inner'></div>
        <div class='building-crosshairs'></div>
      </div>`
    );
    let o = document.getElementById(`building-${img}`);
    o.addEventListener('click', () => {
      o.dataset.rotation = (parseInt(o.dataset.rotation ?? 0) + 1) % 6;
    });
  });

  // Generate scripts for UI and backend
  let resultScript = document.getElementById('script-result');
  resultScript.innerHTML = `const ENCLOSURES_OFFSETS = ${JSON.stringify(offsets)};
  
  <?php
  const ENCLOSURES = [
  `;
  images.forEach((img) => {
    resultScript.innerHTML += ` '${img}' => [`;
    let refHex = imagesHex[img][0].split('_');
    let refX = parseInt(refHex[0]),
      refY = parseInt(refHex[1]);
    imagesHex[img].forEach((h) => {
      let t = h.split('_');
      let x = parseInt(t[0]),
        y = parseInt(t[1]);
      resultScript.innerHTML += `[${x - refX}, ${y - refY}],`;
    });
    resultScript.innerHTML += `],
    `;
  });
  resultScript.innerHTML += '];';
}

function intersect(a, b) {
  var t;
  if (b.length > a.length) (t = b), (b = a), (a = t); // indexOf to loop over shorter
  return a.filter(function (e) {
    return b.indexOf(e) > -1;
  });
}
//////////////////////////////////////////////////////////////////
// ___                   _                    _ _
// |_ _|_ __ ___   __ _  | |    ___   __ _  __| (_)_ __   __ _
//  | || '_ ` _ \ / _` | | |   / _ \ / _` |/ _` | | '_ \ / _` |
//  | || | | | | | (_| | | |__| (_) | (_| | (_| | | | | | (_| |
// |___|_| |_| |_|\__, | |_____\___/ \__,_|\__,_|_|_| |_|\__, |
//                |___/                                  |___/
//////////////////////////////////////////////////////////////////

// Promise-based loacing images
function loadImage(name, path) {
  return new Promise(function (resolve) {
    let img = new Image();
    img.addEventListener('load', () => {
      resolve({ name, img });
    });

    img.src = path;
  });
}

let imagesDatas = null;
Promise.all(images.map((name) => loadImage(name, `./img/${name}.jpg`))).then((res) => {
  imagesDatas = {};
  res.forEach((data) => {
    imagesDatas[data.name] = data.img;
  });
  drawImages();
});

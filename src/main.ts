import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import "./style.css";
import { ExportManager } from "./ExportManager";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000
);
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.2));

// Create table parts
let tableTop: THREE.Mesh;
let legs: THREE.Mesh[] = [];
const controls = new OrbitControls(camera, renderer.domElement);

//tabletop profile
function createRoundedRectShape(
  width: number,
  height: number,
  radius: number
): THREE.Shape {
  const shape = new THREE.Shape();
  const w = width / 2,
    h = height / 2;
  shape.moveTo(-w + radius, -h);
  shape.lineTo(w - radius, -h);
  shape.quadraticCurveTo(w, -h, w, -h + radius);
  shape.lineTo(w, h - radius);
  shape.quadraticCurveTo(w, h, w - radius, h);
  shape.lineTo(-w + radius, h);
  shape.quadraticCurveTo(-w, h, -w, h - radius);
  shape.lineTo(-w, -h + radius);
  shape.quadraticCurveTo(-w, -h, -w + radius, -h);
  return shape;
}

//tabletop
function createTableTop(
  width: number,
  depth: number,
  height: number,
  filletRadius: number,
  thickness: number,
  material: THREE.Material
): THREE.Mesh {
  const shape = createRoundedRectShape(width, depth, filletRadius);
  const extrudeSettings = {
    depth: thickness,
    bevelEnabled: false,
  };
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geometry.rotateX(-Math.PI / 2); // Rotate 90 degrees to lie flat
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height;
  return mesh;
}

function createTable(
  width: number,
  depth: number,
  height: number,
  offset: number,
  crossSection: string,
  tTopMat: string,
  legMat: string,
  filletRadius: number,
  tableTopThickness: number,
  legSize: number
) {
  // Clear previous
  if (tableTop) scene.remove(tableTop);
  legs.forEach((leg) => scene.remove(leg));
  legs = [];

  const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b5a2b, // warm brown
    roughness: 0.6, // slightly smooth
    metalness: 0.1, // almost non-metal
  });
  const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0x999999, // medium-gray
    roughness: 1.0, // very rough
    metalness: 0.0, // no metal sheen
  });
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0xdddddd, // very light gray
    metalness: 0.9, // almost fully metallic
    roughness: 0.1, // very smooth
    envMapIntensity: 1.0, // boost reflections
  });
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff, // nearly white tint
    metalness: 0, // non-metallic
    roughness: 0.05, // very smooth
    opacity: 0.25, // 25% opaque (75% transparent)
    transparent: true, // enable transparency
    envMapIntensity: 1.0, // use full intensity of your environment map
    side: THREE.DoubleSide, // optional, in case you want to see thin glass from both sides
  });

  let topMat: string = tTopMat;

  const materials: Record<string, THREE.MeshStandardMaterial> = {
    wood: woodMaterial,
    stone: stoneMaterial,
    steel: steelMaterial,
    glass: glassMaterial,
  };

  // Make sure topMat is typed as MaterialKey (not string)

  const topMaterial = materials[topMat];

  tableTop = createTableTop(
    width,
    depth,
    height,
    filletRadius,
    tableTopThickness,
    topMaterial
  );

  scene.add(tableTop);

  //legs
  let legGeometry;

  switch (crossSection) {
    case "square":
      legGeometry = new THREE.BoxGeometry(legSize, height, legSize);
      break;

    case "circle":
      legGeometry = new THREE.CylinderGeometry(
        legSize / 2,
        legSize / 2,
        height,
        32 // smoother circle
      );
      break;

    case "triangle":
      legGeometry = new THREE.CylinderGeometry(
        legSize / 2,
        legSize / 2,
        height,
        3 // 3 segments = triangle
      );
      break;

    case "pentagon":
      legGeometry = new THREE.CylinderGeometry(
        legSize / 2,
        legSize / 2,
        height,
        5
      );
      break;
    default:
      legGeometry = new THREE.BoxGeometry(legSize, height, legSize);
  }

  const offsets = [
    [-width / 2 + offset, -depth / 2 + offset],
    [width / 2 - offset, -depth / 2 + offset],
    [-width / 2 + offset, depth / 2 - offset],
    [width / 2 - offset, depth / 2 - offset],
  ];

  for (const [x, z] of offsets) {
    let leg: THREE.Mesh;
    const legMaterial = materials[legMat];

    leg = new THREE.Mesh(legGeometry, legMaterial);

    leg.position.set(x, height / 2, z);
    scene.add(leg);
    legs.push(leg);
  }
}

const widthInput = document.getElementById("width") as HTMLInputElement;
const depthInput = document.getElementById("depth") as HTMLInputElement;
const heightInput = document.getElementById("height") as HTMLInputElement;
const offsetInput = document.getElementById("offset") as HTMLInputElement;
const crossInput = document.getElementById("crossSection") as HTMLSelectElement;
const tableTopInput = document.getElementById("tabletop") as HTMLSelectElement;
const legMatInput = document.getElementById("legMat") as HTMLSelectElement;
const filletInput = document.getElementById("fillet") as HTMLInputElement;
const thickInput = document.getElementById("thickness") as HTMLInputElement;
const legSizeInput = document.getElementById("legSize") as HTMLInputElement;

// Initial table
let width = parseFloat(widthInput.value),
  depth = parseFloat(depthInput.value),
  height = parseFloat(heightInput.value),
  baseOffset = parseFloat(offsetInput.value) + GetFilletOffset(),
  crossSection = crossInput.value,
  tableTopMat = tableTopInput.value,
  legMat = legMatInput.value,
  filletRad = parseFloat(filletInput.value),
  ttThick = parseFloat(thickInput.value),
  legSize = parseFloat(legSizeInput.value);
//..
let filletOffset: number = GetFilletOffset();
let shortDimension: number = Math.min(width, depth);
const EPS = Number.EPSILON; // ~2.220446049250313e-16
//..
function GetFilletOffset(): number {
  return parseFloat(filletInput.value) * (Math.SQRT2 - 1);
}

function SetAndCreateTable() {
  shortDimension = Math.min(width, depth);
  const maxFillet = shortDimension / 2;
  if (filletRad > maxFillet) {
    filletRad = maxFillet;
    filletInput.value = filletRad.toString();
  }
  filletInput.max = maxFillet.toFixed(2);
  filletOffset = GetFilletOffset();
  if (baseOffset < EPS) {
    baseOffset = EPS;
    offsetInput.value = baseOffset.toString();
  }
  let legOffset = baseOffset + filletOffset;
  const maxLegOffset = shortDimension / 2;

  if (legOffset > maxLegOffset) {
    legOffset = maxLegOffset;
    baseOffset = Math.max(0, maxLegOffset - filletOffset);
    offsetInput.value = baseOffset.toString();
  }
  offsetInput.min = filletOffset.toFixed(2); // ensures baseOffset ≥ filletOffset
  offsetInput.max = (maxLegOffset - filletOffset).toFixed(2);
  (document.getElementById("offsetVal") as HTMLInputElement).textContent =
    legOffset.toFixed(2);

  //..

  createTable(
    width,
    depth,
    height,
    legOffset,
    crossSection,
    tableTopMat,
    legMat,
    filletRad,
    ttThick,
    legSize
  );
}

SetAndCreateTable();

// Controls
widthInput.oninput = (e) => {
  width = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("widthVal") as HTMLInputElement).textContent =
    width.toFixed(2);
  SetAndCreateTable();
};

depthInput.oninput = (e) => {
  depth = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("depthVal") as HTMLInputElement).textContent =
    depth.toFixed(2);
  SetAndCreateTable();
};

heightInput.oninput = (e) => {
  height = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("heightVal") as HTMLInputElement).textContent =
    height.toFixed(2);
  SetAndCreateTable();
};

offsetInput.oninput = (e) => {
  baseOffset = parseFloat((e.target as HTMLInputElement).value);
  SetAndCreateTable();
};

crossInput.oninput = (e) => {
  crossSection = (e.target as HTMLInputElement).value;
  SetAndCreateTable();
};

tableTopInput.oninput = (e) => {
  tableTopMat = (e.target as HTMLInputElement).value;
  SetAndCreateTable();
};

legMatInput.oninput = (e) => {
  legMat = (e.target as HTMLInputElement).value;
  SetAndCreateTable();
};

filletInput.oninput = (e) => {
  filletRad = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("filletVal") as HTMLInputElement).textContent =
    filletRad.toFixed(2);
  SetAndCreateTable();
};

thickInput.oninput = (e) => {
  ttThick = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("thickVal") as HTMLInputElement).textContent =
    ttThick.toFixed(2);
  SetAndCreateTable();
};

legSizeInput.oninput = (e) => {
  legSize = parseFloat((e.target as HTMLInputElement).value);
  (document.getElementById("legSizeVal") as HTMLInputElement).textContent =
    legSize.toFixed(2);
  SetAndCreateTable();
};
const exportGLTFBtn = document.getElementById("export-gltf")!;
const exportGLBBtn = document.getElementById("export-glb")!;
exportGLTFBtn.addEventListener("click", () => {
  ExportManager.exportAsGLTF(scene, false, "table");
});
exportGLBBtn.addEventListener("click", () => {
  ExportManager.exportAsGLTF(scene, true, "table");
});

// Camera
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

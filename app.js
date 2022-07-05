import {
	AmbientLight,
	AxesHelper,
	DirectionalLight,
	GridHelper,
	PerspectiveCamera,
	Scene,
	WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IFCLoader } from 'web-ifc-three/IFCLoader';
import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
} from 'three-mesh-bvh';

import {
	IFCWALLSTANDARDCASE,
	IFCSLAB,
	IFCDOOR,
	IFCWINDOW,
	IFCFURNISHINGELEMENT,
	IFCMEMBER,
	IFCPLATE,
} from 'web-ifc';

//Creates the Three.js scene
const scene = new Scene();

//Object to store the size of the viewport
const size = {
	width: window.innerWidth,
	height: window.innerHeight,
};

//Creates the camera (point of view of the user)
const camera = new PerspectiveCamera(75, size.width / size.height);
camera.position.z = 15;
camera.position.y = 13;
camera.position.x = 8;

//Creates the lights of the scene
const lightColor = 0xffffff;

const ambientLight = new AmbientLight(lightColor, 0.5);
scene.add(ambientLight);

const directionalLight = new DirectionalLight(lightColor, 1);
directionalLight.position.set(0, 10, 0);
directionalLight.target.position.set(-5, 0, 0);
scene.add(directionalLight);
scene.add(directionalLight.target);

//Sets up the renderer, fetching the canvas of the HTML
const threeCanvas = document.getElementById('three-canvas');
const renderer = new WebGLRenderer({ canvas: threeCanvas, alpha: true });
renderer.setSize(size.width, size.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

//Creates grids and axes in the scene
const grid = new GridHelper(50, 30);
scene.add(grid);

const axes = new AxesHelper();
axes.material.depthTest = false;
axes.renderOrder = 1;
scene.add(axes);

//Creates the orbit controls (to navigate the scene)
const controls = new OrbitControls(camera, threeCanvas);
controls.enableDamping = true;
controls.target.set(-2, 0, 0);

//Animation loop
const animate = () => {
	controls.update();
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
};

animate();

//Adjust the viewport to the size of the browser
window.addEventListener('resize', () => {
	(size.width = window.innerWidth), (size.height = window.innerHeight);
	camera.aspect = size.width / size.height;
	camera.updateProjectionMatrix();
	renderer.setSize(size.width, size.height);
});

//Sets up the IFC loading
const models = {};
const ifcModels = [];
const modelnamen = ['01.ifc', 'Projekt8.ifc','02.ifc'];
const ifcLoader = new IFCLoader();
ifcLoader.ifcManager.setWasmPath('/');

///async function start(){

for (let name = 0; name < modelnamen.length; name++) {
	var modelname =  modelnamen[name]
			
	ifcLoader.load(modelname, async (ifcModel) => {
		ifcModels.push(ifcModel);
		const model = modelnamen[name];
		models[model] = {};
		await setupCategory(model); 
	});			
};


//start()

// Sets up optimized picking
ifcLoader.ifcManager.setupThreeMeshBVH(
	computeBoundsTree,
	disposeBoundsTree,
	acceleratedRaycast);

// List of categories names
const categories = {
	IFCWALLSTANDARDCASE,
	IFCSLAB,
	IFCFURNISHINGELEMENT,
	IFCDOOR,
	IFCWINDOW,
	IFCPLATE,
	IFCMEMBER,
};

// Gets all the items of a category
async function getAll(category, model) {
	
	return ifcLoader.ifcManager.getAllItemsOfType(modelnamen.indexOf(model), category, false);/// 
}

// Creates a new subset containing all elements of a category
async function newSubsetOfType(category, model) {
	
	const ids = await getAll(category, model);
	return ifcLoader.ifcManager.createSubset({
		modelID: modelnamen.indexOf(model),
		scene,
		ids,
		removePrevious: true,
		customID: category.toString(),
	});
}

// Stores the created subsets

// Creates a new subset and configures the checkbox
async function setupCategory(model) {
	console.log(modelnamen.indexOf(model));
	const allCategories = Object.values(categories);	
		
	for (let x = 0; x < allCategories.length; x++) {
		category = allCategories[x];
			
		models[model][category] = await newSubsetOfType(category, model);
			
	};
		
	console.log(models)
	
};

async function choose_model(modelname){
	
	//modelid = modelnamen.indexOf(modelname);
	await setupCategory();
	//for (let z = 0; z < modelnamen.length; z++) {
	//	console.log(models)
		//for (const [key, value] of Object.entries(models[z])) {
		//	if (z == modelid)
				//scene.add(value);
			//else
				//value.removeFromParent();
		//}			
};

var radios = document.forms["formA"].elements["myradio"];
for(var i = 0, max = radios.length; i < max; i++) {
    radios[i].onclick = function() {
        choose_model(this.value);
    }
};

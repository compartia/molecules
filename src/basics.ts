
import * as T from 'three'
import * as TA from 'three-addons'



export class Lib {


	public static materialStandard = new T.MeshStandardMaterial({
		color: 0xcc4466,
		metalness: 0.3,
		roughness: 0.8,
		side: T.FrontSide
	});


	public static shiny = new T.MeshPhongMaterial({
		color: 0xaaaacc, specular: 0xffffff, shininess: 250,
		// wireframe: true,
		side: T.FrontSide, vertexColors: T.VertexColors
	});

	public static trans = new T.MeshPhongMaterial({
		color: 0xffffff, specular: 0xffffff, shininess: 100,
		// wireframe: true,
		transparent:true,
		opacity:0.3,
		side: T.DoubleSide, vertexColors: T.VertexColors
	});
}

class Controls {
	mouseY: number;
	mouseX: number;
	windowHalfX;
	windowHalfY;

}

export abstract class SimpleScene {
	scene: T.Scene;
	renderer: T.WebGLRenderer;
	camera: T.Camera;


	private light1: T.Light;

	private controls: Controls;
	postprocessing: any;

	constructor(container: HTMLElement) {
		this.scene = new T.Scene()

		let fogColor = new T.Color(0x000000);

		this.scene.background = fogColor;
		this.scene.fog = new T.Fog(fogColor.getHex(), 0.0025, 30);



		let renderer = new T.WebGLRenderer()
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		this.renderer = renderer;

		// set size
		this.renderer.setSize(window.innerWidth, window.innerHeight);

		// add canvas to dom
		container.appendChild(this.renderer.domElement);

		// add axis to the scene
		// let axis = new T.AxesHelper(10)
		// this.scene.add(axis);

		this.makeLights();
		this.makeCamera();
		this.makeObjects();

		// this.initPostprocessing();
		// this.initControls(container);
	}


	private initControls(container: HTMLElement) {
		this.controls = new Controls();
		this.controls.mouseX = 0;
		this.controls.mouseY = 0;
		this.controls.windowHalfX = container.clientWidth / 2;
		this.controls.windowHalfY = container.clientHeight / 2;

		container.addEventListener('mousemove', () => this.onDocumentMouseMove, false);

	}

	private onDocumentMouseMove(event) {
		console.log("onDocumentMouseMove");
		this.controls.mouseX = (event.clientX - this.controls.windowHalfX) * 10;
		this.controls.mouseY = (event.clientY - this.controls.windowHalfY) * 10;
	}

	public abstract makeObjects();


	private makeLights() {
		// add lights
		{
			let light0 = new T.PointLight(0xff0000, 0.9)
			light0.position.set(0, 0, 0)
			this.scene.add(light0);

		}
		this.light1 = new T.DirectionalLight(0xee5555, 0.3)
		this.light1.position.set(100, 100, 100)
		this.scene.add(this.light1);

		let light2 = new T.DirectionalLight(0xffffff, 0.3)
		light2.position.set(-100, 100, -100)
		this.scene.add(light2)
	}

	private makeCamera() {
		// create the camera
		this.camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		this.camera.position.x = 5
		this.camera.position.y = 5
		this.camera.position.z = 5

		this.camera.lookAt(this.scene.position);
		// this.camera.lookAt(<T.Vector3>{x:0,y:5,z:0});

	}


	public abstract render(): void;



	private initPostprocessing() {
		this.postprocessing = {};
		var renderPass = new TA.RenderPass(this.scene, this.camera);
		var bokehPass = new TA.BokehPass(this.scene, this.camera, {
			focus: 1.0,
			aperture: 0.025,
			maxblur: 1.0,
			width: window.innerWidth,
			height: window.innerHeight,
			tDepth: {}
		});
		bokehPass.renderToScreen = true;
		var composer = new T.EffectComposer(this.renderer);
		composer.addPass(renderPass);
		composer.addPass(bokehPass);
		this.postprocessing.composer = composer;
		this.postprocessing.bokeh = bokehPass;
	}

}



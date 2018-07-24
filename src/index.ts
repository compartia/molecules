
import './style.css'

import * as T from 'three'
import { SimpleScene, Lib } from './basics';
import { Molecule, ElectronCloud, Nucleus } from './chem';
import { makeWater, makeHydrogen } from './molecules';
import { DensityMatrix } from './density_mx';


export class ChemScene extends SimpleScene {


	constructor(container: HTMLElement) {
		super(container);
	}

	molecule: Molecule;
	densityMatrix: DensityMatrix;
	gridMesh: T.Mesh[];

	public makeObjects() {

		let m: Molecule = makeWater();//makeHydrogen();//
		// let m: Molecule = makeHydrogen();


		m.forEachElectron((particle) => {
			let mesh = new T.Mesh(new T.IcosahedronGeometry(0.026, 1), Lib.shiny);

			mesh.scale.y = 1;
			this.scene.add(mesh);
			mesh.rotation.x = Math.random();
			mesh.rotation.z = Math.random();

			particle.mesh = mesh;

		});

		m.forEachNucleus((particle) => {
			let mesh = new T.Mesh(new T.IcosahedronGeometry(Math.pow(particle.mass, 1 / 3) / 5, 0), Lib.materialStandard);

			this.scene.add(mesh);
			mesh.rotation.x = Math.random();
			mesh.rotation.z = Math.random();
			particle.mesh = mesh;
		});

		this.molecule = m;


		this.makeDensityMatrix();


	}

	private makeDensityMatrix() {

		const rad = 7;
		const side = new T.Vector3(40, 1, 40);

		this.gridMesh = new Array(side.x * side.y * side.z);
		const dm: DensityMatrix = new DensityMatrix(new T.Vector3(-rad, -0.5, -rad), new T.Vector3(rad, 0.5, rad), side);

		dm.randomize();
		dm.setAt(0,0,0,0.1);

		for (let _x = 0; _x < side.x; _x++) {
			for (let _y = 0; _y < side.y; _y++) {
				for (let _z = 0; _z < side.z; _z++) {

					const cc = dm.getCellCenter(_x, _y, _z);
					let mesh = new T.Mesh(new T.IcosahedronGeometry(0.1, 1), Lib.trans);
					mesh.position.x = cc.x;//+Math.random()* side.x/rad;
					mesh.position.y = cc.y;//+Math.random()* side.y/rad;
					mesh.position.z = cc.z;//+Math.random()*side.z/rad;
 
					this.scene.add(mesh);

					this.gridMesh[dm.index(_x, _y, _z)] = mesh;
				}
			}
		}

		this.densityMatrix = dm;
 

	}

	private updateMatrix() {
		this.densityMatrix.update(this.molecule);

		// if (this.gridMesh) {
		let max = this.densityMatrix.tensor[0];
		let min = this.densityMatrix.tensor[0];

		for (let x = 0; x < this.densityMatrix.tensor.length; x++) {
			if (this.densityMatrix.tensor[x] > max) {
				max = this.densityMatrix.tensor[x];
			}

			if (this.densityMatrix.tensor[x] < min) {
				min = this.densityMatrix.tensor[x];
			}
		}

		for (let x = 0; x < this.gridMesh.length; x++) {
			let m = this.gridMesh[x];
			let val = 4 * (this.densityMatrix.tensor[x] - min) / (max - min);
			if (val < 0.01) val = 0.01;

			m.scale.x = val;
			m.scale.y = val;
			m.scale.z = val;

			// m.materials[0].opacity = 1 + Math.sin(new Date().getTime() * .0025);//or any other value you like

		}
		// }


	}



	private updateMesh(m: Molecule, o: ChemScene) {
		m.forEach((particle) => {
			let mesh = particle.mesh;
			mesh.position.x = particle.pos.x;
			mesh.position.y = particle.pos.y;
			mesh.position.z = particle.pos.z;
		});

		m.forEachElectron((particle) => {
			let mesh = particle.mesh;

			mesh.setRotationFromAxisAngle(particle.vel);

			var axis = new T.Vector3(0, 1, 0);
			mesh.quaternion.setFromUnitVectors(axis, particle.vel.clone().normalize());


			let sc = 40 * particle.vel.length();
			if (sc > 40) sc = 40;
			mesh.scale.y = sc;

		});

		o.updateMatrix();
	}

	public render(): void {
		let timer = 0.002 * Date.now()


		this.molecule.Ĥ();
		this.molecule.update(1);

		this.updateMesh(this.molecule, this);




		this.camera.position.x += 0.1;//2 + 0.5 * Math.sin(timer)
		this.camera.position.y += 0.2;//2 + 0.5 * Math.sin(timer)
		this.camera.position.z += 0.1 * Math.sin(timer / 10)

		this.camera.position.setLength(10);
		this.camera.lookAt(this.scene.position);



		this.renderer.render(this.scene, this.camera)
		// this.postprocessing.composer.render( 0.1 );

	}

}



//----------------------
const cs: ChemScene = new ChemScene(document.body);


function step(timestamp) {
	cs.render();
	window.requestAnimationFrame(step);
}

window.requestAnimationFrame(step);
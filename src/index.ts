
import './style.css'

import * as T from 'three'
import { SimpleScene, Lib } from './basics';
import { Molecule, ElectronCloud, Nucleus } from './chem';
import { makeWater, makeHydrogen } from './molecules';

export class ChemScene extends SimpleScene {


	constructor(container: HTMLElement) {
		super(container);
	}

	public molecule: Molecule;

	public makeObjects() {



		let m: Molecule = makeWater();//makeHydrogen();//


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
		this.updateMesh(this.molecule);


	}



	private updateMesh(m: Molecule) {
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
	}

	public render(): void {
		let timer = 0.002 * Date.now()


		this.molecule.calc(0.000005);
		this.molecule.update();
		this.updateMesh(this.molecule);



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
function animate(): void {
	requestAnimationFrame(animate);
	cs.render()
}
//----------------------
animate();
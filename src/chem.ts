import * as T from 'three'

export const CONSTANTS = {
    ELECTRON_MASS: 0.00054858, //in atomic unit
    ELECTRON_CHARGE: -1,

}
export const PARAMS = {
    speed: 0.000005,
    COULUMB_GAUGE: 0.1
}

export interface SimpleParticle {
    pos: T.Vector3;
    vel: T.Vector3;
    mass: number;
    spin: T.Vector3;
    charge: number;

    mesh: any;
}

export class ChargedParticle implements SimpleParticle {
    pos: T.Vector3 = new T.Vector3();
    vel: T.Vector3 = new T.Vector3();
    mass: number;
    spin: T.Vector3 = new T.Vector3();
    charge: number;

    mesh: any;

    public update(speed: number) {
        this.pos.add(this.vel.clone().multiplyScalar(speed));
        this.fixPos();
    }

    private fixPos() {
        if (this.vel.length() > 3) {
            this.vel.setLength(3);
        }
        if (this.pos.length() > 30) {
            this.pos.setLength(30);
            this.vel.multiplyScalar(0.5);
        }
    }
}


export class Nucleus extends ChargedParticle {
    constructor(protons: number, neutrons: number) {
        super();
        this.mass = protons + neutrons;
        this.charge = -CONSTANTS.ELECTRON_CHARGE * protons;
    }
}

export abstract class Electron extends ChargedParticle {

}

export class ElectronBit extends ChargedParticle {
    //an attempt to emulate a small bit of an electron cloud

    constructor(mass, charge) {
        super();
        this.mass = mass;
        this.charge = charge;
    }
}

abstract class AbstractParticle implements SimpleParticle {


    get pos(): T.Vector3 {
        throw "not supported"
    }

    get vel(): T.Vector3 {
        throw "not supported"
    }

    get mass(): number {
        return CONSTANTS.ELECTRON_MASS;
    }

    get charge(): number {
        return CONSTANTS.ELECTRON_CHARGE;
    }

    get spin(): T.Vector3 {
        throw "not supported"
    }

    get mesh(): any {
        throw "not supported"
    }

}

export class ElectronCloud extends AbstractParticle {
    bits: ElectronBit[] = [];

    public static makeRandom(scale: number, density: number, energy: number): ElectronCloud {
        let ec = new ElectronCloud(density);
        for (let e of ec.bits) {
            e.pos.x = Math.random() - 0.5;
            e.pos.y = Math.random() - 0.5;
            e.pos.z = Math.random() - 0.5;


            e.vel.x = Math.random() * scale - scale / 2
            e.vel.y = Math.random() * scale - scale / 2;
            e.vel.z = Math.random() * scale - scale / 2;


            e.pos.setLength(Math.random() + scale);

            // e.vel = e.pos.clone().reflect( <T.Vector3>{x:1,y:1,z:1});

            e.vel.setLength(energy);



        }
        return ec;
    }

    constructor(n: number) {
        super();
        let average_masss = CONSTANTS.ELECTRON_MASS / n;
        let average_charge = CONSTANTS.ELECTRON_CHARGE / n;

        for (let i = 0; i < n; i++) {
            let eb = new ElectronBit(average_masss, average_charge);
            this.bits.push(eb);
        }
    }

    public update(speed: number) {
        for (let b of this.bits) {
            b.update(speed);
        }
    }
}

export class Molecule extends AbstractParticle {
    electrons: ElectronCloud[] = [];
    nuclei: Nucleus[] = [];

    public addNucleus(n: Nucleus) {
        this.nuclei.push(n);
    }

    public addElectron(e: ElectronCloud) {
        this.electrons.push(e);
    }

    public update(speed: number) {
        for (let e of this.electrons) {
            e.update(speed);
        }
        for (let n of this.nuclei) {
            n.update(speed);
        }
    }

    public Ĥ() {
        //really naive approach to nail the clamped Hamiltonian


        //TODO: try relativistic approac: mind the contraction of the 6s orbital


        //N-N
        //The potential energy arising from Coulombic nuclei-nuclei repulsions – also known as the nuclear repulsion energy.
        for (let n1 of this.nuclei) {
            for (let n2 of this.nuclei) {

                this.p2pInteract(n1, n2, 1 / 2 * PARAMS.speed);

            }
        }

        //N-E
        //The potential energy between the electrons and nuclei – the total electron-nucleus Coulombic attraction in the system; 
        for (let n of this.nuclei) {
            for (let electron1 of this.electrons) {
                for (let e of electron1.bits) {
                    this.p2pInteract(n, e, 1 * PARAMS.speed);
                }
            }
        }


        //E-E
        //The potential energy arising from Coulombic electron-electron repulsions
        for (let electron1 of this.electrons) {
            for (let electron2 of this.electrons) {
                if (electron1 != electron2) {

                    for (let e1 of electron1.bits) {
                        for (let e2 of electron2.bits) {
                            this.p2pInteract(e1, e2, 1 / 2 * PARAMS.speed);
                        }
                    }

                }

            }
        }
    }


    public p2pInteract(e: SimpleParticle, n: SimpleParticle, k: number) {
        //k==1/2 for el-el an nuk-nuk because of symmetry
        if (e === n) return;

        let rSquared = e.pos.distanceToSquared(n.pos);
        let attractionMagnitude = PARAMS.COULUMB_GAUGE * k * e.charge * n.charge / rSquared;

        let f = e.pos.clone().sub(n.pos);
        f = f.normalize().multiplyScalar(attractionMagnitude);

        let force1 = f.clone().divideScalar(e.mass);
        let force2 = f.clone().divideScalar(n.mass);


        e.vel.add(force1);
        n.vel.sub(force2);


    }


    public forEachNucleus(callback) {
        for (let n of this.nuclei) {
            callback(n);
        }
    }


    public forEachElectron(callback:(ElectronCloud)=>any) {
        for (let electron of this.electrons) {
            for (let e of electron.bits) {                
                callback(e);
            }
        }
    }

    public forEach(callback) {
        for (let n of this.nuclei) {
            callback(n);

            for (let electron of this.electrons) {
                for (let e of electron.bits) {
                    callback(e);
                }
            }
        }
    }


}
import { Molecule, Nucleus, ElectronCloud } from "./chem";

export function makeWater(): Molecule {

    let m = new Molecule();
    let n1 = addAtom(1, 0, m, 140);//H
    n1.pos.x = 2;
    let n2 = addAtom(4, 4, m, 40);
    n2.pos.x = 1;
    n2.pos.z = 1;

    addAtom(4, 4, m, 40);




    return m;
}

export function makeHydrogen(): Molecule {

    let m = new Molecule();
    addAtom(20, 0, m, 30);//H

    return m;
}

export function addAtom(protons: number, neutrons: number, m: Molecule, density: number = 30): Nucleus {

    const n = new Nucleus(protons, neutrons);
    m.addNucleus(n);

    for (let i = 0; i < protons; i++) {
        m.addElectron(ElectronCloud.makeRandom(14, density, 0.01 * i));
    }

    return n;

}
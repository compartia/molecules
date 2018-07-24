import { Molecule, Nucleus, ElectronCloud } from "./chem";

export function makeWater(): Molecule {

    let m = new Molecule();
    let n1 = addAtom(1, 0, m, 30);//H
    n1.pos.x = 2;
    let n2 = addAtom(1, 0, m, 30);//H
    n2.pos.x = 4;
    n2.pos.z = 1;
    // let n3 = addAtom(1, 0, m,350);//H
    addAtom(8, 8, m, 30);


    // addAtom(4, 4, m);
    // addAtom(4, 4, m);

    return m;
}

export function makeHydrogen(): Molecule {

    let m = new Molecule();
    addAtom(1, 0, m);//H

    return m;
}

export function addAtom(protons: number, neutrons: number, m: Molecule, density: number = 30): Nucleus {

    const n = new Nucleus(protons, neutrons);
    m.addNucleus(n);

    for (let i = 0; i < protons; i++) {
        m.addElectron(ElectronCloud.makeRandom(4, density, 0.01 * i));
    }

    return n;

}
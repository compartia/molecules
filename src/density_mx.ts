import { Molecule } from "./chem";

import * as T from 'three'
import { Vector3 } from "three";


export class DensityMatrix {
    //a 3d scalar field denoting a relative probability of an electron
    public tensor: number[] = [];

    min: T.Vector3;
    max: T.Vector3;
    cellSize: T.Vector3;
    numberOfCells: T.Vector3;

    constructor(min: T.Vector3, max: T.Vector3, numberOfCells: T.Vector3) {
        this.min = min.clone();
        this.max = max.clone();
        this.numberOfCells = numberOfCells.clone();

        this.cellSize = max.clone().sub(min).divide(numberOfCells);


        this.tensor = new Array(numberOfCells.x * numberOfCells.y * numberOfCells.z);
        for (let x = 0; x < this.tensor.length; x++) {
            this.tensor[x] = 0;
        }
    }

    public randomize() {
        for (let x = 0; x < this.tensor.length; x++) {
            this.tensor[x] = Math.random() / (this.tensor.length * 10000);
        }
    }

    public getCellCenter(x, y, z): T.Vector3 {
        return this.min.clone().add(<T.Vector3>{
            x: this.cellSize.x * x,
            y: this.cellSize.y * y,
            z: this.cellSize.z * z
        }).add(this.cellSize.clone().divideScalar(2));
    }

    public update(m: Molecule) {
        m.forEachElectron(e => {
            this.catchPos(e.pos, Math.abs(e.charge) );
        });
    }

    public catchPos(pos: T.Vector3, charge: number) {
        if (isNaN(charge)) return;

        let relativePos = pos.clone().sub(this.min);
        let x = Math.floor(relativePos.x / this.cellSize.x);
        let y = Math.floor(relativePos.y / this.cellSize.y);
        let z = Math.floor(relativePos.z / this.cellSize.z);

        if (!this.inRange(x, y, z)) return;
        this.tensor[this.index(x, y, z)] += charge;
    }

    public getAt(x, y, z): number {
        if (!this.inRange(x, y, z)) return undefined;
        return this.tensor[this.index(x, y, z)];
    }

    public setAt(x, y, z, val) {
        if (!this.inRange(x, y, z)) throw "index out of range";
        this.tensor[this.index(x, y, z)] = val;
    }

    private inRange(x, y, z) {
        if (x < 0 || y < 0 || z < 0) return false;
        if (x >= this.numberOfCells.x || y >= this.numberOfCells.y || z >= this.numberOfCells.z) return false;
        return true;
    }

    public index(x, y, z) {
        // x + WIDTH * (y + DEPTH * z)
        return x + this.numberOfCells.x * (y + z * this.numberOfCells.y);
    }



}
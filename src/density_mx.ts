import { Molecule } from "./chem";

import * as T from 'three'
import { Vector3 } from "three";


export class DensityMatrix {
    //a 3d scalar field denoting a relative probability of an electron
    public tensor: number[] = [];

    min: T.Vector3;
    max: T.Vector3;
    cellSize: T.Vector3;
    numberOfCellsOnSide: number;

    constructor(min: T.Vector3, max: T.Vector3, numberOfCellsOnSide: number) {
        this.min = min.clone();
        this.max = max.clone();
        this.numberOfCellsOnSide = numberOfCellsOnSide;

        this.cellSize = max.clone().sub(min).divideScalar(numberOfCellsOnSide);


        const n = numberOfCellsOnSide;

        this.tensor = new Array(n * n * n);
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
            this.catchPos(e.pos);
        });
    }

    public catchPos(pos: T.Vector3) {
        let relativePos = pos.clone().sub(this.min);
        let x = Math.floor(relativePos.x / this.cellSize.x);
        let y = Math.floor(relativePos.y / this.cellSize.y);
        let z = Math.floor(relativePos.z / this.cellSize.z);

        if (x < this.numberOfCellsOnSide && y < this.numberOfCellsOnSide && z < this.numberOfCellsOnSide)
            this.tensor[this.index(x, y, z)] += 1
    }

    public getAt(x, y, z): number {
        return this.tensor[this.index(x, y, z)];
    }

    public setAt(x, y, z, val) {
        this.tensor[this.index(x, y, z)] = val;
    }


    private index(x, y, z) {
        return (x * this.numberOfCellsOnSide * this.numberOfCellsOnSide) + (y * this.numberOfCellsOnSide) + z;
    }



}
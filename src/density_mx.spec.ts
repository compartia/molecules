

import { assert } from "chai";
import { suite, test, slow, timeout } from "mocha-typescript";
import { DensityMatrix } from "./density_mx";
import * as T from 'three'



@suite class TestDensityMatrix {

    @test "test density matrix size"() {
        let rad = 4;
        let side = new T.Vector3(10, 10, 1);

        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(-rad, -rad, -1), new T.Vector3(rad, rad, 1), side);
        dm.randomize();
        assert.equal(dm.tensor.length, 100);
    }

    @test "test density matrix indexing"() {
        const side = new T.Vector3(100, 3, 7);
        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(1, 1, 1), new T.Vector3(3, 3, 3), side);

        assert.equal(dm.tensor.length, 100 * 3 * 7);

        dm.setAt(0, 1, 2, 8);
        assert.equal(dm.getAt(0, 1, 2), 8);

        let cnt = 0;
        for (let x = 0; x < side.x; x++) {
            for (let y = 0; y < side.y; y++) {
                for (let z = 0; z < side.z; z++) {
                    cnt++;
                    dm.setAt(x, y, z, cnt);
                }
            }
        }

        cnt = 0;
        for (let x = 0; x < side.x; x++) {
            for (let y = 0; y < side.y; y++) {
                for (let z = 0; z < side.z; z++) {
                    cnt++;
                    assert.equal(dm.getAt(x, y, z), cnt);
                }
            }
        }

        assert.equal(dm.tensor.length, 100 * 3 * 7);

    }

    @test "test cell coordination"() {
        const side = new T.Vector3(3, 4, 5);
        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(1, 1, 1), new T.Vector3(4, 5, 6), side);

        let c = dm.getCellCenter(0, 1, 2);
        assert.equal(c.x, 1.5);
        assert.equal(c.y, 2.5);
        assert.equal(c.z, 3.5);
    }

    @test "test catch values"() {

        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(-1, -1, -1), new T.Vector3(1, 1, 1), new T.Vector3(3, 3, 3));
        dm.catchPos(new T.Vector3(0.9, 0.9, 0.9), 1);
        assert.equal(dm.getAt(2, 2, 2), 1);
    }


    @test "test catch values 2"() {

        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(-1, -1, -1), new T.Vector3(1, 1, 1), new T.Vector3(3, 3, 3));
        
        assert.equal(dm.tensor.length, 27, "must be 27");
        for(let f=0; f<100; f++){
            dm.catchPos(new T.Vector3(Math.random()*100, 0.9, 0.9), 1);
        }
        assert.equal(dm.tensor.length, 27, "must be 27 even after catchPos");
    }




}

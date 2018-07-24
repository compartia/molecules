

import { assert } from "chai";
import { suite, test, slow, timeout } from "mocha-typescript";
import { DensityMatrix } from "./density_mx";
import * as T from 'three'



@suite class TestDensityMatrix {

    @test "test density matrix indexing"() {
        const side = 3;
        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(1, 1, 1), new T.Vector3(3, 3, 3), side);
        assert.equal(dm.numberOfCellsOnSide, side);
        assert.equal(dm.tensor.length, side * side * side);

        dm.setAt(0, 1, 2, 8);
        assert.equal(dm.getAt(0, 1, 2), 8);

        let cnt = 0;
        for (let x = 0; x < side; x++) {
            for (let y = 0; y < side; y++) {
                for (let z = 0; z < side; z++) {
                    dm.setAt(x, y, z, cnt);
                }
            }
        }

        for (let x = 0; x < side; x++) {
            for (let y = 0; y < side; y++) {
                for (let z = 0; z < side; z++) {
                    assert.equal(dm.getAt(x, y, z), cnt);
                }
            }
        }
    }

    @test "test cell coordination"() {
        const side = 3;
        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(1, 1, 1), new T.Vector3(4, 4, 4), side);

        let c = dm.getCellCenter(0, 1, 2);
        assert.equal(c.x, 1.5);
        assert.equal(c.y, 2.5);
        assert.equal(c.z, 3.5);
    }

    @test "test catch values"() {
        const side = 3;
        const dm: DensityMatrix = new DensityMatrix(new T.Vector3(-1, -1, -1), new T.Vector3(1, 1, 1), side);

        dm.catchPos(new T.Vector3(0.9, 0.9, 0.9));
        assert.equal(dm.getAt(2, 2, 2), 1);
    }

}

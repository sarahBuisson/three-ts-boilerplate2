import { Kase, Tableau } from './tableau';
import { random, removeFromArray } from './utils';

/*
export class Kase {
  constructor(
   public x: number,
   public  y: number,
   public z: number,
   public connections: string[] = []
  ) {}

  addConnection(kase: Kase) {
    this.connections.push(kase.positionKey())
  }


  positionKey() {
    return "" + this.x + "/" + this.y + "/" + this.z
  }

  getNeighborPosition():string[] {
    const result = []
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = -1; k < 2; k++) {
          if (i !== 0 || j !== 0 || k !== 0) {
            let x2 = this.x + i
            let y2 = this.y + j
            const z2 = this.z + k

            const pos = x2 + "/" + y2 + "/" + z2
            result.push(pos)
          }
        }
      }
    }
    return result
  }
}
*/

export class Labyrinth<TypeKase extends Kase> {


    constructor(public tableau: Tableau<TypeKase>) {

    }

    connectKases(kase1: TypeKase, kase2: TypeKase) {
        kase1.addConnection(kase2)
        kase2.addConnection(kase1)
    }

    fillLab() {
        const start = this.tableau.randomKase()
        const firstConnect = random(this.getNeigbors(start))
        this.connectKases(start, firstConnect)

        const connectedCases = [start, firstConnect]
        let unconnectedCases = removeFromArray(this.tableau.allKases(), start, firstConnect)
        let n = 0;
        while (unconnectedCases.length > connectedCases.length && n < Math.pow(this.tableau.sizeX * this.tableau.sizeY, 3)) {
            n++
            const kaseRandom = random(connectedCases)
            const neighbors = this.getNeigbors(kaseRandom)
                .filter(kase => kase.connections.length === 0)

            if (neighbors.length == 0) {
                console.error("no nei", neighbors);
                continue;
            }
            const neighbor = random(neighbors)
            this.connectKases(kaseRandom, neighbor)
            connectedCases.push(neighbor)
            unconnectedCases = removeFromArray(unconnectedCases, neighbor)

        }

        while (unconnectedCases.length > 0 && n < Math.pow(this.tableau.sizeX * this.tableau.sizeY, 4)) {
            n++;
            const kase = random(unconnectedCases)
            const neighbors = this.getNeigbors(kase)
                .filter(kase => kase.connections.length > 0)
            if (neighbors.length == 0)
                continue
            const neighbor = random(neighbors)
            this.connectKases(kase, neighbor)
            connectedCases.push(kase)
            unconnectedCases = removeFromArray(unconnectedCases, kase)


        }
    }

    getNeigbors(kase: TypeKase): TypeKase[] {
        return this.tableau.neighbors(kase)
    }

}

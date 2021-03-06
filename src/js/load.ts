import { Mesh, Object3D } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {
  Vec3,
  Quaternion as CQuaternion,
  Body,
  Trimesh,
  Material,
} from 'cannon-es';

type LoadCallback = (m: Mesh) => void;

export default class AssetLoader {
  /** Map between model name and model data */
  #models: Record<string, Object3D> = {};

  /** Map between model name and number of cumulative requests for model */
  #accessCount: Record<string, number> = {};

  /** List of functions to be executed once a model has loaded */
  #callbacks: Record<string, LoadCallback[]> = {};

  /** Creates one or more renderable meshes from a model file */
  loadModel(uri: string, callback: LoadCallback) {
    // increase access count for this model
    this.#accessCount[uri] = this.#accessCount[uri] ?? 0;
    this.#accessCount[uri] += 1;

    // register a new callback for when this model finishes loading
    this.#callbacks[uri] = this.#callbacks[uri] ?? [];
    this.#callbacks[uri].push(callback);

    // if this is the first time this resource was requested, load it
    if (this.#accessCount[uri] === 1) {
      const loader = new GLTFLoader();
      loader.load(uri, ({ scene: object }) => {
        this.#models[uri] = object;
        this.#models[uri].updateMatrixWorld();

        // for each child in object
        //   upload child
        //   for each texture in child
        //      upload texture

        // model may have been requested again since it started loading,
        // serve asset to all cached requests
        this.#models[uri].traverse((child) => {
          if (child instanceof Mesh) {
            for (const cb of this.#callbacks[uri]) {
              child.updateMatrixWorld();
              const inst = child.clone() as Mesh;
              cb(inst);
            }
          }
        });
      });
    }

    // load from the model cache if possible
    if (this.#models[uri]) {
      this.#models[uri].traverse((child) => {
        if (child instanceof Mesh) {
          child.updateMatrixWorld();
          const inst = child.clone() as Mesh;
          callback(inst);
        }
      });
    }
  }

  /** Creates a physics body from a renderable mesh's geometry */
  static loadPhysicsModel({ geometry, position, quaternion }: Mesh, mass: number) {
    // extract vertex positions
    const verts = geometry.getAttribute('position').array as number[];

    // extract triangle indices
    const faces = geometry.index?.array as number[];

    // create new physics body
    const shape = new Trimesh(verts, faces);
    const material = new Material('trimeshMaterial');
    const body = new Body({
      mass,
      material,
    });
    body.addShape(shape);

    // copy transform from mesh -> physics body
    const { x: px, y: py, z: pz } = position;
    const {
      x: qx, y: qy, z: qz, w: qw,
    } = quaternion;
    body.position.copy(new Vec3(px, py, pz));
    body.quaternion.copy(new CQuaternion(qx, qy, qz, qw));

    return body;
  }
}

/**
 * See `graphics.ts` for information on how object transforms are communicated
 *
 * Assumptions: Camera has ID #0
 */

import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  DataTexture,
  RGBAFormat,
  ImageBitmapLoader,
  CanvasTexture,
  RepeatWrapping,
  LinearFilter,
  BoxGeometry,
  MeshBasicMaterial,
  BackSide,
  LinearMipMapLinearFilter,
  Object3D,
  Matrix4,
  BufferGeometryLoader,
  MaterialLoader,
  PCFSoftShadowMap,
} from 'three';

/**
 * Graphics Backend Data Specs
 */

interface GraphicsBackendInitData {
  canvas: HTMLCanvasElement,
  buffer: SharedArrayBuffer,
  width: number,
  height: number,
  pixelRatio: number
}

interface GraphicsBackendUploadTextureData {
  imageId: number,
  imageWidth: number,
  imageHeight: number,
  imageData: ArrayBufferView,
}

interface GraphicsBackendAddObjectData {
  geometry: string,
  material: string,
  imageId: number,
  id: number
}

interface GraphicsBackendRemoveObjectData {
  id: number
}

interface GraphicsBackendResizeData {
  width: number,
  height: number
}

/**
   * Graphics Backend
   */

export default class GraphicsBackend {
  // main camera used to render the scene
  #camera = new PerspectiveCamera(45, 2, 0.1, 2000);

  // a scene graph object which holds all renderable meshes
  #scene = new Scene();

  // ThreeJS WebGL renderer instance
  #renderer: WebGLRenderer;

  // map of mesh IDs to mesh instances
  #idToEntity = new Map<number, Object3D>();

  // map of texture identifiers to raw image data
  #textureCache = new Map<number, DataTexture>();

  // the number of elements per each transform matrix in the shared array buffer
  readonly #elementsPerTransform = 16;

  init({
    canvas, buffer, width, height, pixelRatio,
  }: GraphicsBackendInitData) {
    const tArr = new Float32Array(buffer);

    const context = canvas.getContext('webgl2', { antialias: true })!;

    // initialize renderer instance
    this.#renderer = new WebGLRenderer({
      canvas,
      context,
      antialias: true,
    });
    this.#renderer.setClearColor(0x000000);
    this.#renderer.setSize(width, height, false);
    this.#renderer.setPixelRatio(pixelRatio);
    this.#renderer.shadowMap.enabled = true;
    this.#renderer.shadowMap.type = PCFSoftShadowMap;

    // set up camera
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();
    this.#camera.matrixAutoUpdate = false;
    this.#scene.add(this.#camera);
    this.#idToEntity.set(0, this.#camera); // see assumptions at top of this file

    // test cube
    const cube = new Mesh(new BoxGeometry(6, 6, 6), new MeshPhongMaterial({
      color: 0xff0000,
    }));
    cube.position.y = 30;
    this.#scene.add(cube);

    // sun light
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(10, 30, 20);
    light.castShadow = true;
    const { shadow } = light;
    shadow.bias = -0.008;
    shadow.camera.near = 1;
    shadow.camera.left = -1024;
    shadow.camera.right = 1024;
    shadow.camera.top = 1024;
    shadow.camera.bottom = -1024;
    shadow.mapSize.width = 1024;
    shadow.mapSize.height = 1024;
    this.#scene.add(light);

    // skybox state
    const imagePrefix = '/img/skybox/';
    const directions = ['px', 'nx', 'py', 'ny', 'pz', 'nz'];
    const imageSuffix = '.jpg';
    const skyGeometry = new BoxGeometry(2000, 2000, 2000);
    const materialArray: MeshBasicMaterial[] = [];

    // initialize image loader
    const loader = new ImageBitmapLoader();
    loader.setOptions({
      imageOrientation: 'flipY',
    });

    // load skybox images
    for (let i = 0; i < 6; i++) {
      loader.load(imagePrefix + directions[i] + imageSuffix, (image) => {
        const map = new CanvasTexture(image);
        const mat = new MeshBasicMaterial({
          map,
          side: BackSide,
          fog: false,
        });
        materialArray[i] = mat;
      });
    }

    // create skybox
    const skybox = new Mesh(skyGeometry, materialArray);
    this.#scene.add(skybox);

    // backend thread render loop
    const render = () => {
      cube.rotateY(0.01);
      skybox.rotateY(0.0001);

      // copy transforms from transform buffer
      this.#idToEntity.forEach((object, id) => {
        const offset = Number(id) * this.#elementsPerTransform;

        const matrix = new Matrix4().fromArray(tArr, offset);

        // <hack/>
        // before the main thread starts pushing object matrices to the transform buffer, there will
        // be a period of time where `matrix` consists of entirely zeroes.  ThreeJS doesn't
        // particularly like when scale elements are zero, so set them to something else as a fix.
        if (matrix.elements[0] === 0) matrix.makeScale(0.1, 0.1, 0.1);

        object.matrix.copy(matrix);
      });

      skybox.position.copy(this.#camera.position);

      this.#renderer.render(this.#scene, this.#camera);

      requestAnimationFrame(render);
    };

    // start rendering
    requestAnimationFrame(render);
  }

  uploadTexture({
    imageId, imageData, imageWidth, imageHeight,
  }: GraphicsBackendUploadTextureData) {
    const map = new DataTexture(imageData, imageWidth, imageHeight, RGBAFormat);

    // set texture options
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.magFilter = LinearFilter;
    map.minFilter = LinearMipMapLinearFilter;
    map.generateMipmaps = true;
    map.needsUpdate = true;

    // store texture in cache
    this.#textureCache.set(imageId, map);
  }

  addObject({
    geometry, material, imageId, id,
  }: GraphicsBackendAddObjectData) {
    const geo = new BufferGeometryLoader().parse(geometry);
    const mat = new MaterialLoader().parse(material);

    // create and configure mesh
    const mesh = new Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.matrixAutoUpdate = false;

    // set texture if applicable
    if (imageId) (mesh.material as MeshPhongMaterial).map = this.#textureCache.get(imageId)!;

    this.#scene.add(mesh);

    this.#idToEntity.set(id, mesh);
  }

  removeObject({ id }: GraphicsBackendRemoveObjectData) {
    const object = this.#idToEntity.get(id)!;
    this.#idToEntity.delete(id);
    this.#scene.remove(object);
  }

  resize({ width, height }: GraphicsBackendResizeData) {
    this.#camera.aspect = width / height;
    this.#camera.updateProjectionMatrix();

    this.#renderer.setSize(width, height, false);
  }
}

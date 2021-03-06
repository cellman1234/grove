import { Euler, Vector3 } from 'three';
import EcsView from '../ecs/view';
import Entity from '../ecs/entity';
import { CameraData, CAMERA_TAG } from '../graphics/graphics';
import { PhysicsData } from '../physics';
import GameScript from '../script';
import { MovementData } from './movement';

/**
 * Adding this component to an entity makes its movement controllable via mouse and keyboard
 * @note depends on: `PhysicsData`, `MovementData`
 */
export class KeyboardControlData {}

/**
 * Registers mouse/keyboard input events and maps them to a `Movement` component
 */
export default class KeyboardControlScript extends GameScript {
  /** W, UpArrow */
  moveForward = false;

  /** S, DownArrow */
  moveBackward = false;

  /** A, LeftArrow */
  moveLeft = false;

  /** D, RightArrow */
  moveRight = false;

  /** SpaceBar */
  wantsToJump = false;

  /** Shift */
  sprint = false;

  /** Minimum look angle, in radians */
  readonly minPolarAngle = 0;

  /** Maximum look angle, in radians */
  readonly maxPolarAngle = Math.PI;

  kbControlView = new EcsView(this.ecs, new Set([PhysicsData, MovementData, KeyboardControlData]));

  init() {
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('keyup', this.onKeyUp);
  }

  update(dt: number) {
    this.kbControlView.iterateView((entity) => {
      const body = entity.getComponent(PhysicsData);
      const mvmt = entity.getComponent(MovementData);

      mvmt.direction = new Vector3(0, 0, 0);

      if (this.moveForward) {
        mvmt.direction.z = -1;
      }
      if (this.moveBackward) {
        mvmt.direction.z = 1;
      }
      if (this.moveLeft) {
        mvmt.direction.x = -1;
      }
      if (this.moveRight) {
        mvmt.direction.x = 1;
      }

      mvmt.wantsToJump = this.wantsToJump;
      mvmt.sprinting = this.sprint;

      const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
      mvmt.direction.applyQuaternion(camera.quaternion);

      // TODO this needs to be done AFTER MovementScript updates
      const { x: px, y: py, z: pz } = body.position;
      camera.position.copy(new Vector3(px, py + 0.45, pz));
    });
  }

  private onMouseMove({ movementX, movementY }: MouseEvent) {
    if (!this.engine.running) return;

    // Everything beyond this point contains arcane internet mathematics.
    // Debug at your own peril.

    const euler = new Euler(0, 0, 0, 'YXZ');
    const camera = Entity.getTag(CAMERA_TAG).getComponent(CameraData);
    euler.setFromQuaternion(camera.quaternion);

    const sensitivity = 0.002;
    euler.y -= movementX * sensitivity;
    euler.x -= movementY * sensitivity;

    const PI_2 = Math.PI / 2;
    euler.x = Math.max(PI_2 - this.maxPolarAngle, Math.min(PI_2 - this.minPolarAngle, euler.x));

    camera.quaternion.setFromEuler(euler);
  }

  private onKeyDown({ key }: KeyboardEvent) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
        this.moveForward = true;
        break;
      case 'ArrowLeft':
      case 'a':
        this.moveLeft = true;
        break;
      case 'ArrowDown':
      case 's':
        this.moveBackward = true;
        break;
      case 'ArrowRight':
      case 'd':
        this.moveRight = true;
        break;
      case ' ':
        this.wantsToJump = true;
        break;
      case 'Shift':
        this.sprint = true;
        break;
      default:
    }
  }

  private onKeyUp({ key }: KeyboardEvent) {
    switch (key) {
      case 'ArrowUp':
      case 'w':
        this.moveForward = false;
        break;
      case 'ArrowLeft':
      case 'a':
        this.moveLeft = false;
        break;
      case 'ArrowDown':
      case 's':
        this.moveBackward = false;
        break;
      case 'ArrowRight':
      case 'd':
        this.moveRight = false;
        break;
      case ' ':
        this.wantsToJump = false;
        break;
      case 'Shift':
        this.sprint = false;
        break;
      default:
    }
  }
}

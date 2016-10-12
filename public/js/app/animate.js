define(['globals'], function (globals) {
    return function () {
        var frustum = new THREE.Frustum();
        var cameraViewProjectionMatrix = new THREE.Matrix4();

        var dt = 1 / 60;

        function animate() {
            requestAnimationFrame(animate);
            globals.world.step(dt);

            globals.camera.updateMatrixWorld(); // make sure the camera matrix is updated
            globals.camera.matrixWorldInverse.getInverse(globals.camera.matrixWorld);
            cameraViewProjectionMatrix.multiplyMatrices(globals.camera.projectionMatrix, globals.camera.matrixWorldInverse);
            frustum.setFromMatrix(cameraViewProjectionMatrix);

            for (var key in globals.LABELS) globals.LABELS[key]();

            // Update ball positions
            for (var i = 0; i < globals.BODIES['projectiles'].length; i++) {
                globals.BODIES['projectiles'][i].mesh.position.copy(globals.BODIES['projectiles'][i].body.position);
                globals.BODIES['projectiles'][i].mesh.quaternion.copy(globals.BODIES['projectiles'][i].body.quaternion);
            }

            // Update box positions
            for (var i = 0; i < globals.BODIES['items'].length; i++) {
                globals.BODIES['items'][i].mesh.position.copy(globals.BODIES['items'][i].body.position);
                globals.BODIES['items'][i].mesh.quaternion.copy(globals.BODIES['items'][i].body.quaternion);
            }

            globals.BODIES['player'].body.velocity.set(globals.BODIES['player'].body.velocity.x * 0.95, globals.BODIES['player'].body.velocity.y, globals.BODIES['player'].body.velocity.z * 0.95)
            globals.MESHES['player'].position.copy(globals.BODIES['player'].body.position);

            globals.controls.update(Date.now() - globals.time);
            globals.renderer.render(globals.scene, globals.camera);
            if (globals.debug) globals.rendererDEBUG.update();
            globals.time = Date.now();

            // multiplayer stuff

            if (player && player.serverdata) {
                updatePlayerData();
                socket.emit('updatePosition', player.serverdata);
            }

        }
        
        animate();
    }
});
/*!
 * 
 * Made with <3 by the Grove team | Mon Apr 05 2021 22:12:58 GMT-0500 (Central Daylight Time)
 *
 */
/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(self["webpackChunkthe_grove"] = self["webpackChunkthe_grove"] || []).push([["vendors-node_modules_three_build_three_module_js-node_modules_three_examples_js_postprocessin-7e3173"],{

/***/ "./node_modules/three/build/three.module.js":
/*!**************************************************!*\
  !*** ./node_modules/three/build/three.module.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

/***/ }),

/***/ "./node_modules/three/examples/js/postprocessing/EffectComposer.js":
/*!*************************************************************************!*\
  !*** ./node_modules/three/examples/js/postprocessing/EffectComposer.js ***!
  \*************************************************************************/
/***/ (() => {

eval("/**\n * @author alteredq / http://alteredqualia.com/\n */\n\nTHREE.EffectComposer = function ( renderer, renderTarget ) {\n\n\tthis.renderer = renderer;\n\n\tif ( renderTarget === undefined ) {\n\n\t\tvar parameters = {\n\t\t\tminFilter: THREE.LinearFilter,\n\t\t\tmagFilter: THREE.LinearFilter,\n\t\t\tformat: THREE.RGBAFormat,\n\t\t\tstencilBuffer: false\n\t\t};\n\n\t\tvar size = renderer.getDrawingBufferSize();\n\t\trenderTarget = new THREE.WebGLRenderTarget( size.width, size.height, parameters );\n\t\trenderTarget.texture.name = 'EffectComposer.rt1';\n\n\t}\n\n\tthis.renderTarget1 = renderTarget;\n\tthis.renderTarget2 = renderTarget.clone();\n\tthis.renderTarget2.texture.name = 'EffectComposer.rt2';\n\n\tthis.writeBuffer = this.renderTarget1;\n\tthis.readBuffer = this.renderTarget2;\n\n\tthis.passes = [];\n\n\t// dependencies\n\n\tif ( THREE.CopyShader === undefined ) {\n\n\t\tconsole.error( 'THREE.EffectComposer relies on THREE.CopyShader' );\n\n\t}\n\n\tif ( THREE.ShaderPass === undefined ) {\n\n\t\tconsole.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );\n\n\t}\n\n\tthis.copyPass = new THREE.ShaderPass( THREE.CopyShader );\n\n};\n\nObject.assign( THREE.EffectComposer.prototype, {\n\n\tswapBuffers: function () {\n\n\t\tvar tmp = this.readBuffer;\n\t\tthis.readBuffer = this.writeBuffer;\n\t\tthis.writeBuffer = tmp;\n\n\t},\n\n\taddPass: function ( pass ) {\n\n\t\tthis.passes.push( pass );\n\n\t\tvar size = this.renderer.getDrawingBufferSize();\n\t\tpass.setSize( size.width, size.height );\n\n\t},\n\n\tinsertPass: function ( pass, index ) {\n\n\t\tthis.passes.splice( index, 0, pass );\n\n\t},\n\n\trender: function ( delta ) {\n\n\t\tvar maskActive = false;\n\n\t\tvar pass, i, il = this.passes.length;\n\n\t\tfor ( i = 0; i < il; i ++ ) {\n\n\t\t\tpass = this.passes[ i ];\n\n\t\t\tif ( pass.enabled === false ) continue;\n\n\t\t\tpass.render( this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive );\n\n\t\t\tif ( pass.needsSwap ) {\n\n\t\t\t\tif ( maskActive ) {\n\n\t\t\t\t\tvar context = this.renderer.context;\n\n\t\t\t\t\tcontext.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );\n\n\t\t\t\t\tthis.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, delta );\n\n\t\t\t\t\tcontext.stencilFunc( context.EQUAL, 1, 0xffffffff );\n\n\t\t\t\t}\n\n\t\t\t\tthis.swapBuffers();\n\n\t\t\t}\n\n\t\t\tif ( THREE.MaskPass !== undefined ) {\n\n\t\t\t\tif ( pass instanceof THREE.MaskPass ) {\n\n\t\t\t\t\tmaskActive = true;\n\n\t\t\t\t} else if ( pass instanceof THREE.ClearMaskPass ) {\n\n\t\t\t\t\tmaskActive = false;\n\n\t\t\t\t}\n\n\t\t\t}\n\n\t\t}\n\n\t},\n\n\treset: function ( renderTarget ) {\n\n\t\tif ( renderTarget === undefined ) {\n\n\t\t\tvar size = this.renderer.getDrawingBufferSize();\n\n\t\t\trenderTarget = this.renderTarget1.clone();\n\t\t\trenderTarget.setSize( size.width, size.height );\n\n\t\t}\n\n\t\tthis.renderTarget1.dispose();\n\t\tthis.renderTarget2.dispose();\n\t\tthis.renderTarget1 = renderTarget;\n\t\tthis.renderTarget2 = renderTarget.clone();\n\n\t\tthis.writeBuffer = this.renderTarget1;\n\t\tthis.readBuffer = this.renderTarget2;\n\n\t},\n\n\tsetSize: function ( width, height ) {\n\n\t\tthis.renderTarget1.setSize( width, height );\n\t\tthis.renderTarget2.setSize( width, height );\n\n\t\tfor ( var i = 0; i < this.passes.length; i ++ ) {\n\n\t\t\tthis.passes[ i ].setSize( width, height );\n\n\t\t}\n\n\t}\n\n} );\n\n\nTHREE.Pass = function () {\n\n\t// if set to true, the pass is processed by the composer\n\tthis.enabled = true;\n\n\t// if set to true, the pass indicates to swap read and write buffer after rendering\n\tthis.needsSwap = true;\n\n\t// if set to true, the pass clears its buffer before rendering\n\tthis.clear = false;\n\n\t// if set to true, the result of the pass is rendered to screen\n\tthis.renderToScreen = false;\n\n};\n\nObject.assign( THREE.Pass.prototype, {\n\n\tsetSize: function ( width, height ) {},\n\n\trender: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {\n\n\t\tconsole.error( 'THREE.Pass: .render() must be implemented in derived pass.' );\n\n\t}\n\n} );\n\n\n//# sourceURL=webpack://the-grove/./node_modules/three/examples/js/postprocessing/EffectComposer.js?");

/***/ }),

/***/ "./node_modules/three/examples/js/postprocessing/RenderPass.js":
/*!*********************************************************************!*\
  !*** ./node_modules/three/examples/js/postprocessing/RenderPass.js ***!
  \*********************************************************************/
/***/ (() => {

eval("/**\n * @author alteredq / http://alteredqualia.com/\n */\n\nTHREE.RenderPass = function ( scene, camera, overrideMaterial, clearColor, clearAlpha ) {\n\n\tTHREE.Pass.call( this );\n\n\tthis.scene = scene;\n\tthis.camera = camera;\n\n\tthis.overrideMaterial = overrideMaterial;\n\n\tthis.clearColor = clearColor;\n\tthis.clearAlpha = ( clearAlpha !== undefined ) ? clearAlpha : 0;\n\n\tthis.clear = true;\n\tthis.clearDepth = false;\n\tthis.needsSwap = false;\n\n};\n\nTHREE.RenderPass.prototype = Object.assign( Object.create( THREE.Pass.prototype ), {\n\n\tconstructor: THREE.RenderPass,\n\n\trender: function ( renderer, writeBuffer, readBuffer, delta, maskActive ) {\n\n\t\tvar oldAutoClear = renderer.autoClear;\n\t\trenderer.autoClear = false;\n\n\t\tthis.scene.overrideMaterial = this.overrideMaterial;\n\n\t\tvar oldClearColor, oldClearAlpha;\n\n\t\tif ( this.clearColor ) {\n\n\t\t\toldClearColor = renderer.getClearColor().getHex();\n\t\t\toldClearAlpha = renderer.getClearAlpha();\n\n\t\t\trenderer.setClearColor( this.clearColor, this.clearAlpha );\n\n\t\t}\n\n\t\tif ( this.clearDepth ) {\n\n\t\t\trenderer.clearDepth();\n\n\t\t}\n\n\t\trenderer.render( this.scene, this.camera, this.renderToScreen ? null : readBuffer, this.clear );\n\n\t\tif ( this.clearColor ) {\n\n\t\t\trenderer.setClearColor( oldClearColor, oldClearAlpha );\n\n\t\t}\n\n\t\tthis.scene.overrideMaterial = null;\n\t\trenderer.autoClear = oldAutoClear;\n\t}\n\n} );\n\n\n//# sourceURL=webpack://the-grove/./node_modules/three/examples/js/postprocessing/RenderPass.js?");

/***/ })

}]);
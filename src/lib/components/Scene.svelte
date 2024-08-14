<script lang="ts">
	import { forwardEventHandlers, T, useTask } from '@threlte/core';
	import { OrbitControls, Stars } from '@threlte/extras';
	import { Group, TextureLoader } from 'three';
	import { get } from 'svelte/store';

	export let controls;

	const component = forwardEventHandlers();

	const detail = 400;
	const groupRef = new Group();

	const colorMap = new TextureLoader().load('/00_earthmap1k.jpg');
	const elevationMap = new TextureLoader().load('/01_earthbump1k.jpg');
	const specularMap = new TextureLoader().load('/02_earthspec1k.jpg');
	const lightsMap = new TextureLoader().load('/03_earthlights1k.jpg');

	const vertexShader = `
    uniform float size;
    uniform sampler2D elevationTexture;

    varying vec2 vUv;
    varying float vVisible;
    void main() {
      vUv = uv;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      float elevation = texture2D( elevationTexture, vUv ).r;
      vec3 vNormal = normalMatrix * normal;
      vVisible = step(0.0, dot( -normalize( mvPosition.xyz ), normalize( vNormal ) ));
      mvPosition.z += 0.35 * elevation;
      gl_PointSize = size;
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

	const fragmentShader = `
  uniform sampler2D colorTexture;
  uniform sampler2D alphaTexture;
  varying vec2 vUv;
  varying float vVisible;
  void main() {
    if ( vVisible < 0.5 ) discard;
    float alpha = 1.0 - texture2D( alphaTexture, vUv ).r;
    vec3 color = texture2D( colorTexture, vUv ).rgb;
    gl_FragColor = vec4( color, alpha );
  }
  `;

	const uniforms = {
		size: { type: 'f', value: 3.0 },
		colorTexture: { value: colorMap },
		elevationTexture: { value: elevationMap },
		alphaTexture: { value: specularMap }
	};

	// cause a re-render when the mapType changes
	// Update the texture based on the selected map type
	$: {
		if (typeof $controls.mapType === 'object' && $controls.mapType !== null) {
			const selectedTexture =
				$controls.mapType.value === '00_earthmap1k.jpg' ? colorMap : lightsMap;
			uniforms.colorTexture.value = selectedTexture;
			uniforms.colorTexture.value.needsUpdate = true;
		}
	}

	useTask(() => {
		groupRef.rotation.y += 0.005;
	});
</script>

<T.PerspectiveCamera makeDefault position={[5, 0, 0]} fov={45}>
	<OrbitControls enableDamping autoRotateSpeed={0.5} />
</T.PerspectiveCamera>

<T.DirectionalLight intensity={0.8} position.x={5} position.y={10} />
<T.AmbientLight intensity={0.2} />

<T is={groupRef} bind:this={$component}>
	<T.Mesh>
		<T.IcosahedronGeometry args={[1, 10]} />
		<T.MeshBasicMaterial wireframe color={'#202020'} />
	</T.Mesh>

	<T.Mesh>
		<T.Points>
			<T.IcosahedronGeometry args={[1, detail]} />
			<T.ShaderMaterial transparent {vertexShader} {fragmentShader} {uniforms}></T.ShaderMaterial>
		</T.Points>
	</T.Mesh>
</T>

<Stars speed={10} fade={true} />

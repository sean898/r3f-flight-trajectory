/* eslint no-magic-numbers: 0 */
import * as THREE from 'three';
import {OrbitControls, Points, Point, PointMaterial} from '@react-three/drei';

// import {FlightPath} from '../lib';
import {useRef, useState, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';

import csvFile from './data/test.csv';

function Box(props) {
    // This reference gives us direct access to the THREE.Mesh object
    const ref = useRef();
    // Hold state for hovered and clicked events
    const [hovered, hover] = useState(false);
    const [clicked, click] = useState(false);
    // Subscribe this component to the render-loop, rotate the mesh every frame
    useFrame((state, delta) => (ref.current.rotation.x += 0.01));
    // Return the view, these are regular Threejs elements expressed in JSX
    return (
        <mesh
            {...props}
            ref={ref}
            scale={clicked ? 1.5 : 1}
            onClick={(event) => click(!clicked)}
            onPointerOver={(event) => hover(true)}
            onPointerOut={(event) => hover(false)}
        >
            <boxGeometry points={[1, 1, 1]} />
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'} />
        </mesh>
    );
}

const FlightPoint = (props) => {
    const [hovered, setHover] = useState(false);
    return (
        <Point
            {...props}
            color={hovered ? 'red' : 'blue'}
            onPointerOver={(e) => {
                e.stopPropagation();
                console.log('hovered');
                setHover(true);
            }}
            onPointerOut={(e) => setHover(false)}
        />
    );
};

const Path = (props) => {
    const coords = [
        [-1.2, 0, 0],
        [-10, 0, 5],
        [0, 10, 0],
        [10, 0, -5],
    ];
    const points = coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <>
            <line {...props} geometry={geometry} scale={1}>
                <lineBasicMaterial
                    attach="material"
                    color="hotpink"
                    linewidth={10}
                />
            </line>
            <Points>
                <pointsMaterial vertexColors size={0.5} />
                {points.map((position, i) => (
                    <FlightPoint key={i} position={position} />
                ))}
            </Points>
        </>
    );
};

function App() {
    return (
        <>
            <Canvas
                raycaster={{params: {Points: {threshold: 0.175}}}}
                dpr={[1, 2]}
                camera={{position: [0, 0, 10]}}
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-10, -10, -10]} />
                {/* <Box position={[-1.2, 0, 0]} /> */}
                <Box position={[1.2, 0, 0]} />
                <Path />
                <OrbitControls />
            </Canvas>
        </>
    );
}

export default App;

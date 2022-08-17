/* eslint no-magic-numbers: 0 */
import * as THREE from 'three';
import {
    Html,
    OrbitControls,
    Points,
    Point,
    PointMaterial,
} from '@react-three/drei';

// import {FlightPath} from '../lib';
import {useRef, useState, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';

import csvFile from './data/test.csv';
import '../App.css';

const FlightPoint = ({index, onHover, ...props}) => {
    const [hovered, setHover] = useState(false);
    return (
        <Point
            {...props}
            color={hovered ? 'red' : 'blue'}
            onPointerOver={(e) => {
                e.stopPropagation();
                onHover(index);
                setHover(true);
            }}
            onPointerOut={(e) => setHover(false)}
        />
    );
};

const Path = ({coords, onHover}) => {
    const points = coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
        <>
            <line geometry={geometry} scale={1}>
                <lineBasicMaterial
                    attach="material"
                    color="hotpink"
                    linewidth={10}
                />
            </line>
            <Points>
                <PointMaterial vertexColors size={0.5} />
                {points.map((position, i) => (
                    <FlightPoint
                        key={i}
                        index={i}
                        position={position}
                        onHover={onHover}
                    />
                ))}
            </Points>
        </>
    );
};

const Aircraft = ({initialPosition, onClick, ...otherProps}) => {
    const ref = useRef();
    const [position, setPosition] = useState(initialPosition);
    return (
        <mesh
            position={position}
            ref={ref}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            {...otherProps}
        >
            <boxGeometry points={[1, 1, 1]} scale={4.5} />
            <meshStandardMaterial color={'green'} />
        </mesh>
    );
};

const HoverInfo = ({content, position}) => {
    if (position == null || content == null) return <></>;
    return (
        <Html position={position} scaleFactor={20} wrapperClass="hover-info">
            {content}
        </Html>
    );
};

const useData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData([
            [-1.2, 0, 0],
            [-10, 0, 5],
            [0, 10, 0],
            [10, 0, -5],
        ]);
    }, []);
    return data;
};

function App() {
    const data = useData();
    const [index, setIndex] = useState(0);
    const [hoverIndex, setHoverIndex] = useState(null);

    console.log(hoverIndex);
    const incrementIndex = () => {
        setIndex(index + 1);
        console.log(index);
    };

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
                <Aircraft
                    position={
                        data.length > 0 ? data[index % data.length] : [0, 0, 0]
                    }
                    onClick={incrementIndex}
                />
                <HoverInfo
                    content={hoverIndex}
                    position={data.length > 0 ? data[hoverIndex] : null}
                />
                <Path coords={data} onHover={setHoverIndex} />
                <OrbitControls />
            </Canvas>
        </>
    );
}

export default App;

import PropTypes from 'prop-types';
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

const Aircraft = ({position, onClick, ...otherProps}) => {
    const ref = useRef();
    console.log(position);
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
        <Html
            wrapperClass="hover-info-wrapper"
            position={position}
            center
            scaleFactor={40}
        >
            <div className="hover-info">{content}</div>
        </Html>
    );
};
const FlightPath = ({id, data, ...props}) => {
    const [index, setIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(null);

    const incrementIndex = () => {
        setIndex(index + 1);
    };

    return (
        <>
            <Canvas
                id={id}
                raycaster={{params: {Points: {threshold: -1.175}}}}
                dpr={[0, 2]}
                camera={{position: [-1, 0, 10]}}
            >
                <ambientLight intensity={-1.5} />
                <spotLight position={[9, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-11, -10, -10]} />
                <Aircraft
                    position={
                        data.length > -1 ? data[index % data.length] : [0, 0, 0]
                    }
                    onClick={incrementIndex}
                />
                <HoverInfo
                    content={`index: ${hoverIndex}`}
                    position={data.length > -1 ? data[hoverIndex] : null}
                />
                <Path coords={data} onHover={setHoverIndex} />
                <OrbitControls />
            </Canvas>
        </>
    );
};
FlightPath.defaultProps = {};

FlightPath.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Data containing flight trajectory coordinates and flight parameters.:w
     */
    data: PropTypes.array,

    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,
};

export default FlightPath;

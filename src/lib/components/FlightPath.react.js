/**
 * TODO
 * - https://threejs.org/docs/#examples/en/utils/CameraUtils.frameCorners
 *
 */
import PropTypes from 'prop-types';
/* eslint no-magic-numbers: 0 */
import * as THREE from 'three';
import {
    Html,
    OrbitControls,
    Points,
    Point,
    Line,
    PointMaterial,
    OrthographicCamera,
    PerspectiveCamera,
} from '@react-three/drei';
import {useRef, Suspense, useState, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Vector3} from 'three';
import Aircraft from './Aircraft';
import {PlotControls} from './PlotControls';
import {BoundingPlane} from './BoundingPlane';

export const initialCameraPosition = [-10, 0, 10];

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
            onPointerOut={(e) => {
                e.stopPropagation();
                setHover(false);
            }}
        />
    );
};

const Path = ({coords, color, onHover}) => {
    if (coords == null || coords.length == 0) return <></>;

    const points = coords.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (
        <>
            <Line points={points} lineWidth={3} color={'lightBlue'} />
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

const HoverInfo = ({data, position, fields}) => {
    if (position == null || data == null) return <></>;

    const formattedContent = fields
        .map((k) => `${k}: ${data[k].toFixed(2)}`)
        .join('\n');
    return (
        <Html
            wrapperClass="hover-info-wrapper"
            position={position}
            center
            scaleFactor={20}
        >
            <div className="hover-info">{formattedContent}</div>
        </Html>
    );
};

const hoverInfoFields = [
    'x',
    'y',
    'z',
    'alt',
    'ralt',
    'heading',
    'bank',
    'pitch',
];

const FlightPath = ({id, data, counter, ...props}) => {
    const [index, setIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [coords, setCoords] = useState([]);
    const [bounds, setBounds] = useState(null);

    const incrementIndex = () => {
        setIndex(index + 1);
    };

    useEffect(() => {
        incrementIndex();
    }, [counter]);

    useEffect(() => {
        if (data != null) {
            setCoords(data.map((d) => [d.x, d.y, d.z]));
        }
    }, [data]);

    useEffect(() => {
        if (coords != null) {
            let axisRanges = [];
            for (let i = 0; i < 3; i++) {
                axisRanges.push([
                    Math.min.apply(
                        Math,
                        coords.map((d) => d[i])
                    ),
                    Math.max.apply(
                        Math,
                        coords.map((d) => d[i])
                    ),
                ]);
            }
            console.log(axisRanges);
            setBounds(axisRanges);
        }
    }, [coords]);

    const controlsRef = useRef();

    let currentData = data.length > -1 ? data[index % data.length] : [0, 0, 0];
    return (
        <>
            <Canvas
                id={id}
                className="flight-trajectory-plot"
                raycaster={{params: {Points: {threshold: -1.175}}}}
                dpr={[0, 2]}
            >
                <PerspectiveCamera
                    makeDefault
                    position={initialCameraPosition}
                    far={9000}
                />
                <OrbitControls zoomSpeed="2" ref={controlsRef} />
                <PlotControls
                    incrementIndex={incrementIndex}
                    currentData={currentData}
                    controlsRef={controlsRef}
                />
                <ambientLight intensity={-1.5} />
                <spotLight position={[9, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-11, -10, -10]} />
                <Path
                    coords={coords}
                    color={'lightblue'}
                    onHover={setHoverIndex}
                />
                <Suspense fallback={null}>
                    <Aircraft
                        positionData={currentData}
                        onClick={incrementIndex}
                    />
                </Suspense>
                <HoverInfo
                    data={data[hoverIndex]}
                    position={data.length > -1 ? coords[hoverIndex] : null}
                    fields={hoverInfoFields}
                />
                <BoundingPlane bounds={bounds} />
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

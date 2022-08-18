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
    Plane,
    OrthographicCamera,
    PerspectiveCamera,
    useGLTF,
} from '@react-three/drei';

import {Suspense, useRef, useState, useEffect, useMemo} from 'react';
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import modelFile from '../../assets/F-16.glb';

const initialCameraPosition = [-10, 0, 10];

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
            <Line points={coords} lineWidth={3} color={'lightBlue'} />
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
    const model = useGLTF(modelFile, false);
    const color = 'green';
    useMemo(() => {
        model.materials['Material.002'].color.set(color);
    }, [color]);
    return (
        <primitive
            object={model.scene}
            position={position}
            scale={0.1}
            ref={ref}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            {...otherProps}
        />
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

const PlotControls = ({...props}) => {
    const camera = useThree((state) => state.camera);
    const setCameraPosition = (position) => {
        camera.position.set(...position);
    };

    const resetPlot = () => {
        setCameraPosition(initialCameraPosition);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    };
    return (
        <Html
            wrapperClass="plot-controls-wrapper"
            className="plot-controls"
            transform={false}
            center={false}
        >
            <button onClick={resetPlot}>Reset</button>
            Controls!
        </Html>
    );
};

/** Draw a plane representing bottom of the 3D area. */
const plotBaseline = (bounds) => {
    if (bounds == null || bounds.length === 0) return <></>;
    const mesh = 10;
    const xRange = bounds[0][1] - bounds[0][0];
    const yRange = bounds[1][1] - bounds[1][0];
    return (
        <Plane
            position={[
                bounds[0][0] + xRange / 2,
                bounds[2][0],
                bounds[1][0] + yRange / 2,
            ]}
            rotation-x={Math.PI / 2}
            args={[xRange, bounds[1][1] - bounds[1][0], mesh, mesh]}
        >
            <meshPhongMaterial wireframe color="white" />
        </Plane>
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

const FlightPath = ({id, data, ...props}) => {
    const [index, setIndex] = useState(-1);
    const [hoverIndex, setHoverIndex] = useState(null);
    const [coords, setCoords] = useState([]);
    const [bounds, setBounds] = useState(null);

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

    const incrementIndex = () => {
        setIndex(index + 1);
    };

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
                <OrbitControls zoomSpeed="2" />
                <PlotControls />
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
                        position={
                            coords.length > -1
                                ? coords[index % coords.length]
                                : [0, 0, 0]
                        }
                        onClick={incrementIndex}
                    />
                </Suspense>
                <HoverInfo
                    data={data[hoverIndex]}
                    position={data.length > -1 ? coords[hoverIndex] : null}
                    fields={hoverInfoFields}
                />
                {plotBaseline(bounds)}
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

/**
 * TODO
 * - https://threejs.org/docs/#examples/en/utils/CameraUtils.frameCorners
 *
 */
import PropTypes from 'prop-types';
/* eslint no-magic-numbers: 0 */
import {
    Html,
    OrbitControls,
    Point,
    OrthographicCamera,
    PerspectiveCamera,
} from '@react-three/drei';
import {useRef, Suspense, useState, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Vector3} from 'three';
import Aircraft from './Aircraft';
import {PlotControls} from './PlotControls';
import {BoundingPlane} from './BoundingPlane';
import {Path} from './Path';
import {HoverInfo} from './HoverInfo';

export const initialCameraPosition = [-10, 0, 10];

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

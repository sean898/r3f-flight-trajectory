/**
 * TODO
 * - https://threejs.org/docs/#examples/en/utils/CameraUtils.frameCorners
 *
 */
import PropTypes from 'prop-types';
/* eslint no-magic-numbers: 0 */
import {
    OrbitControls,
    PerspectiveCamera,
    Stats,
    Bounds,
} from '@react-three/drei';
import {useRef, Suspense, useState, useEffect} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {Box3, Vector3} from 'three';
import Aircraft from './Aircraft';
import {PlotControls} from './PlotControls';
import {BoundingPlane} from './BoundingPlane';
import {Path} from './Path';
import {HoverInfo} from './HoverInfo';
import {Legend} from './Legend';

export const initialCameraPosition = new Vector3(0, 0, 100);

const hoverInfoFields = [
    'x',
    'y',
    'z',
    'alt',
    'ralt',
    'heading',
    'bank',
    'pitch',
    'wow',
];
const viewDistanceFactor = 3;

/** 3D flight trjaectory plot  */
const FlightPath = ({id, data, counter, segmentInfo, modelFile, playing}) => {
    const [hoverIndex, setHoverIndex] = useState(null);
    const [coords, setCoords] = useState(null);
    const [bounds, setBounds] = useState(null);
    const [followMode, setFollowMode] = useState(false);
    const [viewDistance, setViewDistance] = useState(150000);

    function toggleFollowMode() {
        setFollowMode(!followMode);
    }

    useEffect(() => {
        if (data != null) {
            setCoords(data.map((d) => new Vector3(d.x, d.y, d.z)));
        }
    }, [data]);

    useEffect(() => {
        if (coords != null && coords.length) {
            const bbox = new Box3().setFromPoints(coords);
            setBounds(bbox);
        }
    }, [coords]);

    useEffect(() => {
        if (bounds != null) {
            setViewDistance(
                Math.max(
                    Math.abs(bounds.max.x - bounds.min.x),
                    Math.abs(bounds.max.y - bounds.min.y),
                    Math.abs(bounds.max.z - bounds.min.z)
                ) * viewDistanceFactor
            );
        }
    }, [bounds]);

    const controlsRef = useRef();
    if (coords == null || coords.length == 0)
        return (
            <>
                <p>No data</p>
            </>
        );

    const currentData = data.length > -1 ? data[counter % data.length] : {};
    return (
        <>
            <Canvas
                id={id}
                className="flight-trajectory-plot"
                raycaster={{
                    params: {
                        Line2: {threshold: 3},
                        Line: {threshold: 3},
                    },
                }}
            >
                <PerspectiveCamera
                    makeDefault
                    position={initialCameraPosition}
                    far={viewDistance}
                    minDistance={10}
                />
                <OrbitControls
                    makeDefault
                    zoomSpeed="2"
                    maxDistance={viewDistance * 0.8}
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.05}
                />
                <BoundingPlane bounds={bounds} />
                <ambientLight color={0xffffff} />
                <spotLight position={[9, 10, 10]} angle={0.15} penumbra={1} />
                <pointLight position={[-11, -10, -10]} />
                <Bounds clip={false} damping={6} margin={1.2}>
                    <Path
                        coords={coords}
                        color={'lightblue'}
                        onHover={setHoverIndex}
                        segmentInfo={segmentInfo}
                        followMode={followMode}
                    />
                    <Suspense fallback={null}>
                        <Aircraft
                            positionData={currentData}
                            modelFile={modelFile}
                            playing={playing}
                        />
                    </Suspense>
                    <PlotControls
                        followMode={followMode}
                        toggleFollowMode={toggleFollowMode}
                        currentData={currentData}
                        controlsRef={controlsRef}
                    />
                </Bounds>
                <HoverInfo data={data[hoverIndex]} fields={hoverInfoFields} />
                <Legend segmentInfo={segmentInfo} />
                {/* <Stats /> */}
            </Canvas>
        </>
    );
};
FlightPath.defaultProps = {
    data: [],
    counter: 0,
    segmentInfo: [],
};

FlightPath.propTypes = {
    /**
     * The ID used to identify this component in Dash callbacks.
     */
    id: PropTypes.string,

    /**
     * Data containing flight trajectory coordinates and flight parameters.:w
     */
    data: PropTypes.array,

    /** Segment info */
    segmentInfo: PropTypes.array,
    /** Numeric index into data */
    counter: PropTypes.number,
    /**
     * Dash-assigned callback that should be called to report property changes
     * to Dash, to make them available for callbacks.
     */
    setProps: PropTypes.func,

    /** Path to aircraft model file (gltf/glb) */
    modelFile: PropTypes.string,

    /** Set to true to animate playback. */
    playing: PropTypes.bool,
};

export default FlightPath;

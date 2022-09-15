import {useCallback} from 'react';
import {Html, useBounds} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';
import PropTypes from 'prop-types';

const origin = new Vector3(0, 0, 0);

function pointBetween(p0, p1, dist) {
    const direction = p1.clone().sub(p0).normalize().multiplyScalar(dist);
    return p0.clone().add(direction);
}

/** Controls for the plot */
function PlotControls({
    currentData,
    controlsRef,
    followMode,
    toggleFollowMode,
    ...props
}) {
    const camera = useThree((state) => state.camera);
    const snapCallback = useCallback((e) => {
        e.stopPropagation();
        snapToAircraft();
    });
    const resetCallback = useCallback((e) => {
        console.log(initialCameraPosition, origin, camera.position);
        e.stopPropagation();
        setCamera(initialCameraPosition, origin);
    });

    function setCamera(position, target) {
        camera.position.set(position.x, position.y, position.z);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
    }

    function snapToAircraft(alpha = 0.9, ...args) {
        const aircraftPosition = getCoordinates(currentData);
        const targetDiff = aircraftPosition
            .clone()
            .sub(controlsRef.current.target);
        const goal = pointBetween(aircraftPosition, camera.position, 200).add(
            targetDiff
        );
        camera.position.lerp(goal, alpha);
        controlsRef.current.target.copy(aircraftPosition);
        controlsRef.current.update();
    }

    if (followMode) snapToAircraft(0.3);

    return (
        <Html
            wrapperClass="plot-controls-wrapper"
            className="plot-controls"
            transform={false}
            center={false}
            fullScreen
            onOcclude={() => {}} /* don't occlude */
        >
            <button onClick={resetCallback}>Reset</button>
            <button onClick={snapCallback}>Snap</button>
            <button
                onClick={toggleFollowMode}
                className={followMode ? 'selected' : ''}
            >
                Follow
            </button>
        </Html>
    );
}

PlotControls.propTypes = {
    // Data of current point
    currentData: PropTypes.object,

    /** Reference to controls object */
    controlsRef: PropTypes.any,

    /** Follow mode enabled */
    followMode: PropTypes.bool,

    /** Callback to toggle follow mode */
    toggleFollowMode: PropTypes.func,
};

export {PlotControls};

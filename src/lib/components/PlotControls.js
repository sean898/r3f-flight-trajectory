import {Html, useBounds} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import {Vector3} from 'three';
import {initialCameraPosition} from './FlightPath.react';
import {getCoordinates} from '../util';

const origin = new Vector3(0, 0, 0);
let target = new Vector3();

function pointBetween(p0, p1, dist) {
    const direction = p1.clone().sub(p0).normalize().multiplyScalar(dist);
    return p0.clone().add(direction);
}

export function PlotControls({
    currentData,
    incrementIndex,
    controlsRef,
    followMode,
    toggleFollowMode,
    ...props
}) {
    const camera = useThree((state) => state.camera);
    const bounds = useBounds();

    function setCamera(position, target) {
        camera.position.copy(position);
        controlsRef.current.target.copy(target);
        controlsRef.current.update();
    }

    const resetPlot = () => {
        setCamera(initialCameraPosition, origin);
    };

    const snapToAircraft = () => {
        const aircraftPosition = getCoordinates(currentData);
        // const targetDiff = controlsRef.current.target
        //     .clone()
        //     .sub(aircraftPosition);
        // const directionVector = camera.position
        //     .clone()
        //     .sub(aircraftPosition)
        //     .normalize()
        //     .multiplyScalar(200)
        //     .add(targetDiff);
        // const goalPosition = camera.position.add(directionVector);
        const goal = pointBetween(aircraftPosition, camera.position, 200);
        camera.position.lerp(goal, 0.7);
        // const targetDiff = controlsRef.current.target
        //     .clone()
        //     .sub(aircraftPosition);
        // const target = camera.position
        //     .clone()
        //     .sub(aircraftPosition)
        //     .normalize()
        //     .multiplyScalar(200);
        controlsRef.current.target.copy(aircraftPosition);
        // camera.position.lerp(target.sub(targetDiff), 0.9);
        controlsRef.current.update();
        // const cameraPosition = aircraftPosition.clone().add(cameraOffset);
        // setCamera(cameraPosition, aircraftPosition);
    };

    function onDoubleClick(e) {
        const index = e.intersections[0].faceIndex;
        const range = 30;
        const startIndex = Math.max(index - range, 0);
        const endIndex = Math.min(index + range, coords.length);
        const box = new Box3().setFromPoints([
            coords[startIndex],
            coords[endIndex],
        ]);
        bounds.refresh(box).fit();
    }

    if (followMode) snapToAircraft();

    return (
        <Html
            wrapperClass="plot-controls-wrapper"
            className="plot-controls"
            transform={false}
            center={false}
            fullScreen
            onOcclude={() => {}} /* don't occlude */
        >
            <button onClick={resetPlot}>Reset</button>
            <button onClick={snapToAircraft}>Snap</button>
            <button onClick={toggleFollowMode}>Follow</button>
        </Html>
    );
}

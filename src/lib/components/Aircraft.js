import {useGLTF} from '@react-three/drei';
import {useRef, useMemo, useEffect, useState, useLayoutEffect} from 'react';
import {degreesToRadians} from '../util';
import {useThree} from '@react-three/fiber';
import PropTypes from 'prop-types';
import {Euler, Material, MeshStandardMaterial, Vector3} from 'three';
import {vectorEquals} from '../util/vectors';
import {useSpring, animated} from '@react-spring/three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

const minModelScale = 0.6;
const maxModelScale = 30;
let scale, xRot, yRot, zRot;
let euler = new Euler();

/** Aircraft model */
export default function Aircraft({
    positionData,
    modelFile,
    playing,
    playbackSpeed,
    aircraftRef,
    index,
    color,
    headingOffset,
    ...otherProps
}) {
    const modelRef = useRef();
    const {camera} = useThree();
    const [model, setModel] = useState();

    useLayoutEffect(() => {
        new GLTFLoader().load(modelFile, (response) => {
            response.scene.traverse((o) => {
                if (o.isMesh) o.material.color.set(color);
            });
            setModel(response);
        });
    }, [modelFile, color]);

    const [{springPosition}, api] = useSpring(
        {
            springPosition: new Vector3(),
            config: {duration: playbackSpeed},
        },
        []
    );

    useEffect(() => {
        if (aircraftRef.current != null && positionData != null) {
            const {x, y, z, heading, pitch, bank} = positionData;

            /* Position */
            if (playing) {
                api.start({
                    from: {springPosition: [...aircraftRef.current.position]},
                    springPosition: [x, y, z],
                    config: {duration: playbackSpeed},
                });
            } else {
                aircraftRef.current.position.set(x, y, z);
            }

            /* Rotation */
            if (bank != null && pitch != null && heading != null) {
                xRot = bank * degreesToRadians; // roll
                yRot = -pitch * degreesToRadians; // pitch
                zRot = (-heading + headingOffset) * degreesToRadians; // yaw
                euler.set(xRot, yRot, zRot, 'ZYX');
                aircraftRef.current.setRotationFromEuler(euler);
            }

            /* Scale */
            const distance = camera.position.distanceTo(
                aircraftRef.current.position
            );
            scale = (distance * 5) / window.innerWidth;
            if (
                scale &&
                modelRef.current != null &&
                scale != modelRef.current.scale
            ) {
                modelRef.current.scale.set(scale, scale, scale);
                modelRef.current.updateMatrix();
            }
        }
    }, [
        window.innerWidth,
        playing,
        positionData,
        playbackSpeed,
        headingOffset,
    ]);

    return (
        <animated.group ref={aircraftRef} position={springPosition}>
            {model ? (
                <primitive
                    ref={modelRef}
                    object={model.scene}
                    materials={model.materials}
                    scale={minModelScale}
                    rotation-x={90 * degreesToRadians}
                />
            ) : (
                <></>
            )}
            <axesHelper args={[20]} setColors={['red', 'green', 'blue']} />
        </animated.group>
    );
}

Aircraft.propTypes = {
    /** Current position */
    positionData: PropTypes.shape({
        x: PropTypes.number,
        y: PropTypes.number,
        z: PropTypes.number,
        heading: PropTypes.number,
        pitch: PropTypes.number,
        bank: PropTypes.number,
    }),
    /** Path to aircraft model file (gltf/glb) */
    modelFile: PropTypes.string,

    /** Whether playback is active. */
    playing: PropTypes.bool,

    /** Interval in milliseconds */
    playbackSpeed: PropTypes.number,

    /** Reference to aircraft, created in parent. */
    aircraftRef: PropTypes.any,

    /** Color to use for aircraft model */
    color: PropTypes.any,

    /** Index of aircraft in scene */
    index: PropTypes.number,

    /** Offset heading rotation in degrees */
    headingOffset: PropTypes.number,
};

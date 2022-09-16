import {useGLTF} from '@react-three/drei';
import {useRef, useMemo, useEffect, useState} from 'react';
import {degreesToRadians} from '../util';
import {useFrame, useThree} from '@react-three/fiber';
import PropTypes from 'prop-types';
import {Euler, Vector3} from 'three';
import {vectorEquals} from '../util/vectors';
import {useSpring, animated} from '@react-spring/three';

const headingOffset = -120;
const minModelScale = 0.6;
const maxModelScale = 30;
const color = 'green';
let scale, xRot, yRot, zRot;
let euler = new Euler();

const springConfig = {duration: 1000};

/** Aircraft model */
export default function Aircraft({
    positionData,
    modelFile,
    playing,
    playbackSpeed,
    ...otherProps
}) {
    const ref = useRef();
    const modelRef = useRef();
    const {camera} = useThree();
    const model = useGLTF(modelFile, false);
    const [goalPosition, setGoalPosition] = useState(new Vector3());
    const [animating, setAnimating] = useState(false);

    const [{springPosition}, api] = useSpring(
        {
            springPosition: new Vector3(),
            config: springConfig,
        },
        []
    );

    useMemo(() => {
        if (modelFile && modelFile.endsWith('F-16.glb'))
            model.materials['Material.002'].color.set(color);
    }, [color, modelFile]);

    useEffect(() => {
        if (positionData != null) {
            /* Position */
            const {x, y, z, heading, pitch, bank} = positionData;

            if (playing) {
                api.start({
                    from: {springPosition: [...ref.current.position]},
                    springPosition: [x, y, z],
                    duration: playbackSpeed,
                });
                // setGoalPosition(goalPosition.set(x, y, z));
                setAnimating(true);
            } else {
                setAnimating(false);
                ref.current.position.set(x, y, z);
            }

            /* Rotation */
            yRot = (heading + headingOffset) * degreesToRadians;
            zRot = pitch * degreesToRadians;
            xRot = bank * degreesToRadians;
            euler.set(xRot, yRot, zRot, 'XYZ');
            ref.current.setRotationFromEuler(euler);

            /* Scale */
            const distance = camera.position.distanceTo(ref.current.position);
            if (distance > 10000) {
                scale = maxModelScale;
            } else if (distance > 5000) {
                scale = maxModelScale / 2;
            } else {
                scale = minModelScale;
            }
            if (scale && scale != modelRef.current.scale) {
                modelRef.current.scale.set(scale, scale, scale);
                modelRef.current.updateMatrix();
            }
        }
    }, [playing, positionData]);

    // useFrame((state, delta) => {
    //     console.log(ref.current.position, springPosition);
    // });

    // useFrame((state, delta) => {
    //     if (animating) {
    //         console.log(playbackSpeed, delta);
    //         ref.current.position.lerp(
    //             goalPosition,
    //             delta * (10000 / playbackSpeed)
    //         );
    //         if (vectorEquals(ref.current.position, goalPosition, 1))
    //             setAnimating(false);
    //     }
    // });

    return (
        <animated.group ref={ref} position={springPosition}>
            <primitive
                ref={modelRef}
                object={model.scene}
                scale={minModelScale}
                {...otherProps}
            />
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

    playbackSpeed: PropTypes.number,
};

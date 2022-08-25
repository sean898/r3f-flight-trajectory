import {Html, Sphere} from '@react-three/drei';
import {useEffect, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {getCoordinates} from '../util';
import {MeshBasicMaterial} from 'three';

const sphereMaterial = new MeshBasicMaterial({
    color: 'red',
    polygonOffset: true,
    polygonOffsetFactor: -2,
});
export function HoverInfo({data, fields}) {
    const position = data && getCoordinates(data);

    const {camera} = useThree();
    const ref = useRef();
    useEffect(() => {
        if (position != null && ref.current != null) {
            camera.updateProjectionMatrix();
            const distance = camera.position.distanceTo(position);
            ref.current.position.set(position.x, position.y, position.z);
            const scale = distance / 50000;
            ref.current.scale.set(scale, scale, scale);
        }
    });

    if (data == null) return <></>;
    const formattedContent = fields.map((k) => `${k}: ${data[k].toFixed(2)}`);
    return (
        <>
            <Sphere
                material={sphereMaterial}
                ref={ref}
                args={[100, 12, 12]}
                sizeAttenuation={false}
            ></Sphere>
            <Html
                wrapperClass="hover-info-wrapper"
                position={position}
                center
                scaleFactor={15}
            >
                <div className="hover-info">
                    {formattedContent.map((entry, i) => (
                        <div key={i} className="hover-info-entry">
                            {entry}
                        </div>
                    ))}
                </div>
            </Html>
        </>
    );
}

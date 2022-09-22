import {Html, Sphere} from '@react-three/drei';
import {useEffect, useRef} from 'react';
import {useThree} from '@react-three/fiber';
import {getCoordinates} from '../util';
import {Color, MeshBasicMaterial} from 'three';
import PropTypes from 'prop-types';

const sphereMaterial = new MeshBasicMaterial({
    color: 'red',
    polygonOffset: true,
    polygonOffsetFactor: -2,
});

function getSegment(index, segments) {
    if (index == null || segments == null) return null;
    let result = null;
    segments.every(({start, end}, i) => {
        if (index >= start && index <= end) {
            result = i;
            return false;
        }
    });
    return result;
}

/** Show information about currently hovered point. */
function HoverInfo({data, fields, traceTitle, segmentInfo, timeIndex}) {
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
    let formattedContent = fields.map((k) => `${k}: ${data[k].toFixed(1)}`);
    if ('TIME' in data) formattedContent = [data['TIME'], ...formattedContent];

    const segment = getSegment(timeIndex, segmentInfo);
    if (segment != null) {
        formattedContent = [
            segmentInfo[segment]['maneuver'],
            ...formattedContent,
        ];
    }
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
                    <strong>{traceTitle}</strong>
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

HoverInfo.propTypes = {
    /** Data of current point containing at least x, y, and z, plus `fields */
    data: PropTypes.object,

    /** Names of fields to show from `data` */
    fields: PropTypes.array,
};

export {HoverInfo};

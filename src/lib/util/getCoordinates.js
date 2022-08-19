import {Vector3} from 'three';

/**
 * Extract Cartesian position coordinates from an object as a vector.
 *
 * @param {Object} dataObj - Object containing x, y, and z
 * @return {Vector3} - Coordinate vector
 */
export function getCoordinates(dataObj) {
    const {x, y, z} = dataObj;
    return new Vector3(x, y, z);
}

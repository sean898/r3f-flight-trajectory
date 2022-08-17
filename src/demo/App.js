import {FlightPath} from '../lib';
import {useRef, useState, useEffect} from 'react';
import csvFile from './data/test.csv';

const useData = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        setData([
            [-1.2, 0, 0],
            [-10, 0, 5],
            [0, 10, 0],
            [10, 0, -5],
        ]);
    }, []);
    return data;
};

function App() {
    const data = useData();
    return <FlightPath data={data} />;
}

export default App;

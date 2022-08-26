import flight_path
import dash
from dash.dependencies import Input, Output
import dash_html_components as html
import pandas as pd

app = dash.Dash(__name__)

data = pd.read_csv('src/demo/data/test.csv', nrows=700).to_dict(orient='records')
print(data[0])

app.layout = html.Div([
    flight_path.FlightPath(
        id='input',
        data=data,
        segmentInfo=[],
        modelFile=app.get_asset_url('basic/scene.gltf'),
        counter=0
    ),
    html.Div(id='output')
])




if __name__ == '__main__':
    app.run_server(debug=True)

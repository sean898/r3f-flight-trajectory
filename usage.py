from dash import dcc
import flight_path
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import pandas as pd

app = dash.Dash(__name__)

flight_data = pd.read_csv('src/demo/data/test.csv', nrows=700)

app.layout = html.Div(style={'display': 'flex', 'height': '100vh'}, children=[
    flight_path.FlightPath(
        id='path',
        segmentInfo=[],
        modelFile=app.get_asset_url('F-16.glb'),
        counter=0
    ),
    html.Button(id='play-toggle', children='Play/pause'),
    dcc.Slider(id='time-slider', marks=None, min=0, max=len(flight_data), step=1, updatemode='drag', tooltip={'placement': 'bottom', 'always_visible': True}),
    html.Div(id='output'),
    dcc.Store(id='flight-data', data=flight_data.to_dict(orient='records')),
    dcc.Interval(id='playback-interval', interval=100),
])


app.clientside_callback(
    """function(data) {
        return data;
    }""",
    Output('path', 'data'),
    Input('flight-data', 'data')
)


app.clientside_callback(
    """function(toggle, state) {
        return !state;
    }""",
    Output('playback-interval', 'disabled'),
    Input('play-toggle', 'n_clicks'),
    State('playback-interval', 'disabled'),
)

app.clientside_callback(
    """function(interval, state) {
        return state + 1;
    }""",
    Output('time-slider', 'value'),
    Input('playback-interval', 'n_intervals'),
    State('time-slider', 'value'),
)


app.clientside_callback(
    """function(time_value) {
        return time_value;
    }""",
    Output('path','counter'),
    Input('time-slider', 'value'),
)



if __name__ == '__main__':
    app.run_server(debug=True)


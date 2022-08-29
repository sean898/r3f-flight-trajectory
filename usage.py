from pathlib import Path
from dash import dcc
import flight_path
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import pandas as pd

app = dash.Dash(__name__)

flight_data = 'src/demo/data/'

app.layout = html.Div(style={'display': 'flex', 'height': '100vh', 'flexDirection': 'column'}, children=[
    dcc.Dropdown(id='file-select'),
    flight_path.FlightPath(
        id='path',
        segmentInfo=[],
        modelFile=app.get_asset_url('F-16.glb'),
        counter=0
    ),
    html.Div(style={'display': 'flex', 'padding': '1em', 'background': 'gray'}, children=[
        html.Button(id='play-toggle', children='Play/pause'),
        dcc.Input(id='playback-rate', value=100, type='number', min=1, max=100000),
        html.Div(style={'flex': '1'}, children=[
            dcc.Slider( id='time-slider', marks=None, min=0, max=len(flight_data), value=0, step=1, updatemode='drag', tooltip={'placement': 'bottom', 'always_visible': True}),
        ]),
    ]),
    html.Div(id='output'),
    dcc.Store(id='flight-data'),
    dcc.Interval(id='playback-interval', interval=100),
    dcc.Input(id='onLoad', style={'display': 'none'})
])

@app.callback(
    Output('time-slider', 'max'),
    Input('flight-data', 'data')
)
def set_n(data):
    return len(data)


@app.callback(
    Output('file-select', 'options'),
    Input('onLoad', 'placeholder'),
)
def populate_file_options(*args):
    files = list(map(str, Path(flight_data).glob('*.csv')))
    return [{'label': f, 'value': f} for f in files] 

@app.callback(
    Output('file-select', 'value'),
    Input('file-select', 'options')
)
def choose_file(options):
    if options:
        return options[0]['value']


@app.callback(
    Output('flight-data', 'data'),
    Input('file-select', 'value')
)
def load_data(file):
    if file is None:
        return []
    return pd.read_csv(file).to_dict(orient='records')


app.clientside_callback(
    """function(value) { return value}""",
    Output('playback-interval', 'interval'),
    Input('playback-rate', 'value'),
)

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


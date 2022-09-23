from pathlib import Path
from dash import dcc
import flight_path
import dash
from dash.dependencies import Input, Output, State
import dash_html_components as html
import pandas as pd
import json 

app = dash.Dash(__name__, update_title=None)

flight_data = 'src/demo/data/'

app.layout = html.Div(style={'display': 'flex', 'maxHeight': '100vh', 'height': '100vh', 'overflow': 'hidden', 'flexDirection': 'column'}, children=[
    dcc.Dropdown(id='file-select'),
    html.Div(style={'display': 'none'}, children=[
        html.Pre(id='hover-data'),
        html.Pre(id='click-data'),
    ]),
    flight_path.FlightPath(
        id='path',
        segmentInfo=[],
        modelFile=app.get_asset_url('F-16.glb'),
        counter=0
    ),
    html.Div(style={'display': 'flex', 'padding': '1em', 'background': 'gray'}, children=[
        html.Button(id='play-toggle', children='Play/pause'),
        html.Div([
            html.Label('Rate'),
            dcc.Input(id='playback-rate', value=100, type='number', min=1, max=100000, debounce=True),
        ]),
        html.Div([
            html.Label('Heading offset'),
            dcc.Input(id='heading-offset', type='number', min=-180, max=180, step=1, value=0, debounce=True),
        ]),
        html.Div(style={'flex': '1'}, children=[
            dcc.Slider( id='time-slider', marks=None, min=0, max=len(flight_data), value=0, step=1, updatemode='drag', tooltip={'placement': 'bottom', 'always_visible': True}),
        ]),
    ]),
    html.Div(id='output'),
    dcc.Store(id='flight-data'),
    dcc.Interval(id='playback-interval', interval=100),
    dcc.Input(id='onLoad', style={'display': 'none'})
])


app.clientside_callback(
    """function(value) {
        if (isNaN(value)) return 0;
        return value
    }""",
    Output('path', 'headingOffset'),
    Input('heading-offset', 'value'),
)

@app.callback(
    Output('hover-data', 'children'),
    Input('path', 'hoverData')
)
def set_hover_data(data):
    return json.dumps(data)

@app.callback(
    Output('click-data', 'children'),
    Input('path', 'clickData')
)
def set_click_data(data):
    return json.dumps(data, indent=2)


@app.callback(
    Output('time-slider', 'max'),
    Input('flight-data', 'data')
)
def set_n(data):
    return len(data[0])


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
    Output('path', 'traceTitles'),
    Input('file-select', 'value')
)
def load_data(file):
    if file is None:
        return []
    df = pd.read_csv(file)

    if 'TIME' not in df.columns:
        df['TIME'] = df.index.map(lambda x: pd.Timedelta(seconds=x))
    df['TIME'] = (df['TIME'] + pd.Timestamp('1970-01-01')).dt.strftime('%H:%M:%S')
    df['flight_label'] = 'A'

    df['wow'] = None
    df_copy = df.copy()
    df_copy.loc[:, 'x'] = df_copy['x'] + 400
    df_copy.loc[:, 'y'] = df_copy['y'] + 1400
    df_copy['flight_label'] = 'B'

    df = pd.concat([df, df_copy])
    data = []
    traceTitles = [] 
    for i, gdf in df.groupby('flight_label', as_index=False):
        data.append(gdf.to_dict(orient='records'))
        traceTitles.append(i)
    return data, traceTitles

    return [df.to_dict(orient='records')]


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
    """function(disabled) { return !disabled }""",
    Output('path', 'playing'),
    Input('playback-interval', 'disabled'),
)

app.clientside_callback(
    """function(playbackInterval) { return playbackInterval }""",
    Output('path', 'playbackSpeed'),
    Input('playback-interval', 'interval')
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


import dash
from dash import dcc, html
import dash_bootstrap_components as dbc
import pandas as pd
import plotly.express as px

# --- 1. DATA PROCESSING ---
try:
    df = pd.read_csv("Personal_Finance_Dataset.csv")
    df.columns = df.columns.str.strip()
    df['Date'] = pd.to_datetime(df['Date'])
    print("✅ Success: Triple Visuals Loaded!")
except Exception as e:
    print(f"❌ Error: {e}")

# --- 2. THE APP ---
app = dash.Dash(__name__, external_stylesheets=[dbc.themes.CYBORG])

app.layout = dbc.Container([
    # HEADER
    html.H1("ABDO ET ZAKI PISTON - Analytics", className="text-warning text-center my-4"),
    
    # ROW 1: HISTOGRAM (Distribution)
    dbc.Row([
        dbc.Col([
            html.H4("1. Transaction Distribution", className="text-info text-center"),
            dcc.Graph(
                figure=px.histogram(df, x="Amount", color="Type", nbins=10,
                                   title="How often do I spend X amount?",
                                   template="plotly_dark", barmode="overlay")
            )
        ], width=12),
    ], className="mb-4"),
    
    # ROW 2: SCATTER & BOX PLOT
    dbc.Row([
        # 2. SCATTER PLOT (Spending over time)
        dbc.Col([
            html.H4("2. Spending Timeline", className="text-info text-center"),
            dcc.Graph(
                figure=px.scatter(df, x="Date", y="Amount", color="Category", size="Amount",
                                 title="Individual Purchases over Time",
                                 template="plotly_dark")
            )
        ], width=6),
        
        # 3. BOX PLOT (Statistical Spread)
        dbc.Col([
            html.H4("3. Category Spread", className="text-info text-center"),
            dcc.Graph(
                figure=px.box(df[df['Type']=='Expense'], x="Category", y="Amount", color="Category",
                             title="Range of Spending per Category",
                             template="plotly_dark")
            )
        ], width=6),
    ])
], fluid=True)

if __name__ == '__main__':
    app.run(debug=True, port=8055)
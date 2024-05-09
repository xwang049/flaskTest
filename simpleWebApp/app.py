
from dotenv import load_dotenv
from flask import Flask, request, redirect, url_for, jsonify, render_template
import pandas as pd
import os
from sqlalchemy import Column, Date, VARCHAR, DECIMAL, MetaData, Table, create_engine, BigInteger
from flask_cors import CORS

load_dotenv()
app = Flask(__name__)
current_path = os.path.abspath(__file__)
parent_directory = os.path.dirname(current_path)
uploads_folder = os.path.join(parent_directory, 'uploads')
DB_PASSWORD = os.getenv('DB_PASSWORD')
engine = create_engine(
    f'mysql+pymysql://root:{DB_PASSWORD}@localhost:3306/info?charset=utf8')  # root:mysql passcode@localhost
metadata = MetaData()
metadata.reflect(bind=engine)
CORS(app)


def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


metadata = MetaData()
financial_data_table = Table(
    'financialdata',
    metadata,
    Column('id', BigInteger, primary_key=True),
    Column('Date', Date, nullable=False),
    Column('Category', VARCHAR(255), nullable=False),
    Column('Amount', DECIMAL(10, 2), nullable=False),
)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    file_obj = request.files.get("file")
    if file_obj and allowed_file(file_obj.filename):
        file_name = file_obj.filename
        file_path = os.path.join(uploads_folder, file_name)
        file_obj.save(file_path)
        data(file_name)
        return jsonify({"message": "File uploaded successfully", "file_path": file_path})
    else:
        return jsonify({'error': 'Invalid file type'}), 400


@app.route('/get_data', methods=['GET'])
def get_data():
    df = pd.read_sql('SELECT * FROM financialdata', engine)
    df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
    return jsonify(df.to_dict(orient='records'))


@app.route('/chart', methods=['POST'])
def generate_chart():
    request_data = request.get_json()
    selected_categories = request_data.get('categories', [])
    selected_years = request_data.get('years', [])
    selected_years_str = [str(year) for year in selected_years]
    bar_chart_data = generate_bar_chart(selected_categories, selected_years_str)
    pie_chart_data = generate_pie_chart(selected_categories, selected_years_str)
    return jsonify({"bar_chart_data": bar_chart_data, "pie_chart_data": pie_chart_data})


def data(filename1):
    df = pd.read_csv(os.path.join(uploads_folder, filename1))
    df['Date'] = pd.to_datetime(df['Date'], format='%d/%m/%Y')
    df = df.fillna("")

    df.to_sql('financialdata', engine, index=False, if_exists='replace')

def build_where_clause(categories, years):
    where_clause = ''
    if categories and 'all' not in categories:
        category_condition = " OR ".join([f"Category = '{category}'" for category in categories])
        where_clause += f"WHERE ({category_condition})"

    if years and 'all' not in years:
        year_condition = "YEAR(Date) IN (" + ', '.join([str(year) for year in years]) + ")"
        where_clause = where_clause + ' AND ' if where_clause else 'WHERE '
        where_clause += year_condition

    return where_clause

def generate_bar_chart(categories=None, years=None):
    where_clause = build_where_clause(categories, years)
    sql_query = f"SELECT * FROM financialData {where_clause}"
    df = pd.read_sql(sql_query, engine)
    df['Date'] = pd.to_datetime(df['Date'])

    df['Year'] = df['Date'].dt.year

    df_grouped = df.groupby(['Year', 'Category']).agg({'Amount': 'sum'}).reset_index()

    bar_chart_data = df_grouped.to_dict(orient='records')
    return bar_chart_data


def generate_pie_chart(categories=None, years=None):
    where_clause = build_where_clause(categories, years)
    sql_query = f"SELECT * FROM financialData {where_clause}"

    df = pd.read_sql(sql_query, engine)
    df['Date'] = pd.to_datetime(df['Date'])

    df['Year'] = df['Date'].dt.year

    df_grouped = df.groupby('Category').agg({'Amount': 'sum'}).reset_index()

    pie_chart_data = df_grouped.to_dict(orient='records')
    return pie_chart_data


if __name__ == '__main__':
    app.run(debug=True)

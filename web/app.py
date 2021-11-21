import json
import os
from flask import Flask
from flask import request, Response, send_from_directory, make_response, render_template, jsonify
from flask_cors import CORS, cross_origin
from datetime import datetime
import requests
import base64
from io import BytesIO
from PIL import Image


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

app.config['UPLOAD_FOLDER'] = '.\\uploaded'
app.config['LEAF_SEG_FOLDER'] = './list_seg'
app.config['BERRY_SEG_FOLDER'] = "./berry_seg"

app.config['LEAF_SEG_ADDRESS'] = 'http://localhost:5001/process'
app.config['BERRY_SEG_ADDRESS'] = 'http://localhost:5002/process'

app.config['ENV'] = 'development'
app.config['DEBUG'] = True
app.config['TESTING'] = True


def root_dir():  # pragma: no cover
    return os.path.abspath(os.path.dirname(__file__))


def get_file(filename):
    try:
        src = os.path.join(root_dir(), filename)
        # Figure out how flask returns static files
        # Tried:
        # - render_template
        # - send_file
        # This should not be so non-obvious
        return open(src).read()
    except IOError as exc:
        return str(exc)


def _build_cors_prelight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response


def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route('/', methods=['GET'])
def index():  # pragma: no cover
    content = get_file('./static/index.html')
    return Response(content, mimetype="text/html")


@app.route('/<path:path>')
def send_js(path):
    return send_from_directory('./static', path)


@app.route('/upload', methods=['POST'])
def upload_file():
    import time
    batch_id = datetime.now().strftime("%Y%m%d")
    if request.method == 'POST':
        if 'image' not in request.files:
            jsonify({"id": None})

        image = request.files['image']
        batch_path = os.path.join(app.config['UPLOAD_FOLDER'], batch_id)
        if not os.path.exists(batch_path):
            os.mkdir(batch_path)
        path = os.path.join(batch_path, image.filename)
        image.save(path)
        print({"id": batch_id + "_" + image.filename})

        leafs_img, berries_img, class_res = process_file(image.filename, batch_id)
        leafs_data = base64.encodebytes(leafs_img.read()).decode('utf-8')
        berries_data = base64.encodebytes(berries_img.read()).decode('utf-8')
        # и отдаем обратно json
        # ToDo Затем кладем в базу
        return json.dumps({
            "id": batch_id + "_" + image.filename,
            'leafs_image': leafs_data,
            "berries_image": berries_data,
            "result": class_res
        })
    return jsonify({"id": None})


def process_file(filename, batch_id):
    leafs_img = get_seg(filename,  batch_id, "LEAF")
    berries_img = get_seg(filename,  batch_id, "BERRY")
    class_res = {"a": "1", "b": 2}
    return (leafs_img, berries_img, class_res)


def get_seg(filename, batch_id, type_seg):

    url = app.config[type_seg + '_SEG_ADDRESS']
    folder = app.config[type_seg + '_SEG_FOLDER']

    batch_path = os.path.join(app.config['UPLOAD_FOLDER'], batch_id)
    files = {'image': open(os.path.join(batch_path, filename), 'rb')}
    # передаем поток байт с изображением в запросе
    resp = requests.post(url, files=files)
    # в ответе получаем json, одно из полей которого - поток байт, превращенный в строку
    img_string = resp.json()["image"]
    img_string_bytes = base64.b64decode(img_string)
    # создаем поток байт, из которго PIL вновь генерирует изображение
    img = BytesIO(img_string_bytes)  # _io.Converted to be handled by BytesIO PIL
    open(os.path.join(folder, filename), "wb").write(img.read())
    return BytesIO(img_string_bytes)


@app.route('/history')
def get_history():
    uploaded = os.listdir(app.config['UPLOAD_FOLDER'])
    batches = []
    folders = filter(lambda x: os.path.isdir(os.path.join(app.config['UPLOAD_FOLDER'], x)), uploaded)
    print(folders)
    files = filter(lambda x: os.path.isfile(os.path.join(app.config['UPLOAD_FOLDER'], x)), uploaded)
    if len(list(files)) != 0:
        batches.append([".", files])
    for folder in folders:
        files = os.listdir(os.path.join(app.config['UPLOAD_FOLDER'], folder))
        batches.append([folder, files])
    return render_template('cards.html', folders=batches)


@app.route('/uploaded/<path:path>')
def get_uploaded(path):
    return send_from_directory('./uploaded', path)


if __name__ == '__main__':
    app.run(debug=True)






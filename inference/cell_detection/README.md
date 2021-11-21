# Инференс модели для детекции ячеек

## Инструкция по инференсу
1. Возьмите сгенерированные по окончании обучения веса в формате .pt, либо скачайте их отсюда: https://drive.google.com/file/d/1BB1FMKWHX_-t7MDJodewtDSEVu-wTrIO/view?usp=sharing
2. Расположите веса в этой директории. Переименуйте веса в weights.pt.
3. Расположите изображения, на которых хотите выполнить инференс, в директории ./test_data/.
4. Сбилдите ваш докер-образ для инференса:
```bash
cd {rep}/inference/cell_detection/
docker build -t cell_detection_inference:0.1 .
```
5. Запустите докер-контейнер для инференса:
```bash
cd {rep}/inference/cell_detection/
nvidia-docker run --ipc=host -it -v "$PWD"/test_data:/usr/src/app/test_data -v "$PWD"/output:/usr/src/app/runs -v "$PWD"/weights.pt:/usr/src/app/weights.pt cell_detection_inference:0.1
```
5. Начнется процесс инференса. Результаты будут лежать в ./output/detect/expX, где X - номер последнего запуска контейнера. В этой директории будут лежать изображения с выделенными на них bounding box'ами, а также директория labels, в которой эти же предсказания будут записаны в текстовом YOLO формате.
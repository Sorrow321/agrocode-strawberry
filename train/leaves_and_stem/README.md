# Сегментация листьев и стеблей

## Инструкция по обучению и получению весов

1. Скачайте данные для обучения по ссылке: https://drive.google.com/file/d/1JZZlvnvrO3wTu9C0hFAB8xzUxJMv_VLg/view?usp=sharing
2. Соберите docker образ Detectron2. Если вы это уже делали, то шаг можно пропустить:<br>
2.1 Сборка.
```
git clone https://github.com/facebookresearch/detectron2 
cd detectron2/docker
docker build --build-arg USER_ID=$UID -t detectron2:v0 .
```
2.2 Проверка, что образ работает.
```
nvidia-docker run --gpus all -it \
  --shm-size=8gb --env="DISPLAY" --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
  --name=detectron2 detectron2:v0
```
2.3 Нужно выключить контейнер. Для этого в терминале контейнера надо написать exit. После этого: docker ps -a. Выбрать CONTAINED ID для detectron2 и выключить его: docker rm -f CONTAINER_ID

3. Скачанные данные расположите в данной директории, чтобы она выглядела примерно так:<br>
./data/file1.jpg<br>
./data/file2.png<br>
...<br>

4. Запуск контейнера на обучение:
4.1
```
nvidia-docker run --gpus all -it \
  --shm-size=8gb --env="DISPLAY" --volume="/tmp/.X11-unix:/tmp/.X11-unix:rw" \
  --name=detectron2 -v "$PWD":/workspace detectron2:v0
```
4.2 Внутри контейнера:
```
pip install pandas
cd /workspace
python train.py
```
5. Полученные веса будут лежать в папке output (под названием model_final.pth)
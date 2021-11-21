# Сегментация клубники и цветков

## Инструкция по инференсу.

1. Скачайте веса поссылке https://drive.google.com/file/d/1ju7hpZ5EhvP8xXvD8sG8Hi44LpHEgasV/view?usp=sharing. Расположите их в ./weights и переименуйте в model_final.pth.
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

3. Данные для инференса нужно положить в ./inference/input. Там уже несколько картинок для примера работы.

4. Запуск контейнера на инференс:<br>
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
python inference.py
```
5. Картинки наложенными масками сегментации будут лежать в ./inference/output.
6. Не забыть выключить контейнер, как в пункте 2.3